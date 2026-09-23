// src/hooks/useUrlState.js
// Reads and writes product-list filter/pagination state to/from URL search params.
// This ensures refresh, copy-URL, and back/forward all preserve state.

import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

const DEFAULTS = {
  page:     1,
  limit:    10,
  search:   '',
  category: '',
  sortBy:   '',
  sortOrder:'asc',
};

const VALID_LIMITS    = [10, 20, 50];
const VALID_SORT_FIELDS  = ['title', 'price', 'rating', 'stock', ''];
const VALID_SORT_ORDERS  = ['asc', 'desc'];

function parseIntSafe(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function useUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page     = parseIntSafe(searchParams.get('page'), DEFAULTS.page);
  const rawLimit = parseIntSafe(searchParams.get('limit'), DEFAULTS.limit);
  const limit    = VALID_LIMITS.includes(rawLimit) ? rawLimit : DEFAULTS.limit;
  const search   = searchParams.get('search')   ?? DEFAULTS.search;
  const category = searchParams.get('category') ?? DEFAULTS.category;
  const rawSort  = searchParams.get('sortBy')   ?? DEFAULTS.sortBy;
  const sortBy   = VALID_SORT_FIELDS.includes(rawSort) ? rawSort : DEFAULTS.sortBy;
  const rawOrder = searchParams.get('sortOrder') ?? DEFAULTS.sortOrder;
  const sortOrder = VALID_SORT_ORDERS.includes(rawOrder) ? rawOrder : DEFAULTS.sortOrder;

  const setUrlState = useCallback((updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });
      return next;
    }, { replace: false });
  }, [setSearchParams]);

  const setPage      = useCallback((p)  => setUrlState({ page: p }), [setUrlState]);
  const setLimit     = useCallback((l)  => setUrlState({ limit: l, page: 1 }), [setUrlState]);
  const setSearch    = useCallback((s)  => setUrlState({ search: s || null, page: 1 }), [setUrlState]);
  const setCategory  = useCallback((c)  => setUrlState({ category: c || null, page: 1 }), [setUrlState]);
  const setSort      = useCallback((field, order) => setUrlState({ sortBy: field || null, sortOrder: order, page: 1 }), [setUrlState]);

  return { page, limit, search, category, sortBy, sortOrder, setPage, setLimit, setSearch, setCategory, setSort };
}
