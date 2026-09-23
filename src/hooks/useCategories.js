// src/hooks/useCategories.js
import { useState, useEffect } from 'react';
import { fetchCategories } from '../api/categoryApi';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState(null);

  const load = async (signal) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCategories({ signal });
      setCategories(data);
    } catch (err) {
      if (err.name === 'AbortError' || err.message === 'canceled') return;
      setError(err.message || 'Failed to load categories.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, []);

  const retry = () => load();

  return { categories, isLoading, error, retry };
}
