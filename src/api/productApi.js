// src/api/productApi.js
import axiosClient from './axiosClient';

/**
 * Fetch paginated products list.
 */
export const fetchProducts = async ({ limit = 10, skip = 0, signal } = {}) => {
  const response = await axiosClient.get('/products', {
    params: { limit, skip },
    signal,
  });
  return response.data; // { products, total, skip, limit }
};

/**
 * Search products by query string.
 * Race-condition safe via AbortController signal.
 */
export const searchProducts = async ({ q, limit = 10, skip = 0, signal } = {}) => {
  const response = await axiosClient.get('/products/search', {
    params: { q, limit, skip },
    signal,
  });
  return response.data;
};

/**
 * Fetch products filtered by category.
 */
export const fetchProductsByCategory = async ({ category, limit = 10, skip = 0, signal } = {}) => {
  const response = await axiosClient.get(`/products/category/${encodeURIComponent(category)}`, {
    params: { limit, skip },
    signal,
  });
  return response.data;
};

/**
 * Fetch a single product by ID.
 */
export const fetchProductById = async (id, { signal } = {}) => {
  const response = await axiosClient.get(`/products/${id}`, { signal });
  return response.data;
};

/**
 * Add a new product.
 * Note: DummyJSON does not persist the product permanently.
 */
export const addProduct = async (productData) => {
  const response = await axiosClient.post('/products/add', productData);
  return response.data;
};

/**
 * Update an existing product.
 * Note: DummyJSON does not persist changes permanently.
 */
export const updateProduct = async (id, productData) => {
  const response = await axiosClient.put(`/products/${id}`, productData);
  return response.data;
};

/**
 * Delete a product by ID.
 * Note: DummyJSON does not persist the deletion permanently.
 */
export const deleteProduct = async (id) => {
  const response = await axiosClient.delete(`/products/${id}`);
  return response.data;
};
