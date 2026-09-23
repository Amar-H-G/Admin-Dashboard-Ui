// src/api/categoryApi.js
import axiosClient from './axiosClient';

/**
 * Fetch all product categories from DummyJSON.
 * Returns an array of category objects: [{ slug, name, url }]
 */
export const fetchCategories = async ({ signal } = {}) => {
  const response = await axiosClient.get('/products/categories', { signal });
  return response.data;
};
