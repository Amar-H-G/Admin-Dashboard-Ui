// src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

/**
 * Debounces a value by the given delay (ms).
 * Prevents triggering expensive operations on every keystroke.
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
