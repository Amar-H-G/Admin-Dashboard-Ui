// src/hooks/useProducts.js
// Core data-fetching hook for the products page.
// Handles search, category, pagination, sorting, and race-condition prevention.

import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchProducts, searchProducts, fetchProductsByCategory } from '../api/productApi';

const VALID_SORT_FIELDS = ['title', 'price', 'rating', 'stock'];
const VALID_SORT_ORDERS = ['asc', 'desc'];

function clientSort(products, sortBy, sortOrder) {
  if (!sortBy || !VALID_SORT_FIELDS.includes(sortBy)) return products;
  const order = VALID_SORT_ORDERS.includes(sortOrder) ? sortOrder : 'asc';
  return [...products].sort((a, b) => {
    const va = a[sortBy] ?? '';
    const vb = b[sortBy] ?? '';
    if (typeof va === 'string') {
      return order === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    return order === 'asc' ? va - vb : vb - va;
  });
}

export function useProducts({ page, limit, search, category, sortBy, sortOrder }) {
  const [products, setProducts]   = useState([]);
  const [total, setTotal]         = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);

  // Ref to hold the latest AbortController — cancels in-flight stale requests
  const abortRef = useRef(null);

  const load = useCallback(async () => {
    // Cancel any in-flight request before starting a new one
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    const skip = (page - 1) * limit;

    try {
      let data;

      if (search && search.trim()) {
        // Search mode — category filter applied client-side after results arrive
        data = await searchProducts({
          q: search.trim(),
          limit: 100, // fetch more so client-side category filter has something to work with
          skip: 0,
          signal: controller.signal,
        });

        let filtered = data.products;
        if (category) {
          filtered = filtered.filter(
            (p) => p.category === category
          );
        }

        // Apply client-side sort
        filtered = clientSort(filtered, sortBy, sortOrder);

        if (abortRef.current !== controller) return;

        // Manual pagination on the filtered result
        const paginatedSlice = filtered.slice(skip, skip + limit);
        setProducts(paginatedSlice);
        setTotal(filtered.length);

      } else if (category) {
        // Category mode — paginated server-side
        data = await fetchProductsByCategory({
          category,
          limit: 200,
          skip: 0,
          signal: controller.signal,
        });

        if (abortRef.current !== controller) return;

        let sorted = clientSort(data.products, sortBy, sortOrder);
        const paginatedSlice = sorted.slice(skip, skip + limit);
        setProducts(paginatedSlice);
        setTotal(data.products.length);

      } else {
        // Default — all products, paginated server-side
        data = await fetchProducts({ limit, skip, signal: controller.signal });

        if (abortRef.current !== controller) return;

        const sorted = clientSort(data.products, sortBy, sortOrder);
        setProducts(sorted);
        setTotal(data.total);
      }
    } catch (err) {
      if (
        err?.name === 'AbortError' ||
        err?.name === 'CanceledError' ||
        err?.code === 'ERR_CANCELED' ||
        err?.message === 'canceled'
      ) {
        // Stale request was cancelled — do not update state
        return;
      }
      if (abortRef.current === controller) {
        setError(err.message || 'Failed to load products.');
      }
    } finally {
      // Only clear loading if this controller is still the latest
      if (abortRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, [page, limit, search, category, sortBy, sortOrder]);

  useEffect(() => {
    load();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [load]);

  return { products, total, isLoading, error, refetch: load };
}
