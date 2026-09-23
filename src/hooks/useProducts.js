// src/hooks/useProducts.js
// Core data-fetching hook for the products page.
// Handles search, category, pagination, sorting, and race-condition prevention.

import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchProducts } from '../api/productApi';
import { mergeProductsWithLocalMutations } from '../utils/localProductStorage';

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
      // Fetch comprehensive server catalog to merge with local mutations
      const data = await fetchProducts({
        limit: 250,
        skip: 0,
        signal: controller.signal,
      });

      if (abortRef.current !== controller) return;

      // 1. Merge server data with local created, updated, and deleted products
      let dataset = mergeProductsWithLocalMutations(data.products || []);

      // 2. Apply search filter across title, description, brand, and category
      if (search && search.trim()) {
        const query = search.trim().toLowerCase();
        dataset = dataset.filter((p) => {
          const title = (p.title || '').toLowerCase();
          const desc = (p.description || '').toLowerCase();
          const brand = (p.brand || '').toLowerCase();
          const cat = (p.category || '').toLowerCase();
          return (
            title.includes(query) ||
            desc.includes(query) ||
            brand.includes(query) ||
            cat.includes(query)
          );
        });
      }

      // 3. Apply category filter
      if (category) {
        dataset = dataset.filter((p) => p.category === category);
      }

      // 4. Unified client-side sort across all merged items
      const sorted = clientSort(dataset, sortBy, sortOrder);

      // 5. Apply pagination slicing
      const paginatedSlice = sorted.slice(skip, skip + limit);

      setProducts(paginatedSlice);
      setTotal(sorted.length);
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
