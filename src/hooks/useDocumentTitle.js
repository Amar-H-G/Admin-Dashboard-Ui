// src/hooks/useDocumentTitle.js
import { useEffect } from 'react';

/**
 * Dynamically updates document.title according to the current active page.
 * Format: "Page Name | AdminCore"
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    const base = 'AdminCore';
    if (title && title.trim()) {
      document.title = `${title.trim()} | ${base}`;
    } else {
      document.title = 'AdminCore - Inventory Studio';
    }
  }, [title]);
}

export default useDocumentTitle;
