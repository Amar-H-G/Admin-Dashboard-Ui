// src/api/axiosClient.js
// Centralized Axios instance — single source of truth for all HTTP requests.
// Automatically attaches auth token and handles common errors.

import axios from 'axios';

const BASE_URL = 'https://dummyjson.com';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor — attach auth token if present
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — normalize errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with an error status
      const { status, data } = error.response;
      const message = data?.message || getDefaultMessage(status);
      const customError = new Error(message);
      customError.status = status;
      return Promise.reject(customError);
    } else if (error.request) {
      // No response received
      if (axios.isCancel(error)) {
        return Promise.reject(error); // propagate cancellation as-is
      }
      const networkError = new Error('Network error. Please check your connection.');
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    }
    return Promise.reject(new Error(error.message || 'An unexpected error occurred.'));
  }
);

function getDefaultMessage(status) {
  switch (status) {
    case 400: return 'Bad request. Please check your input.';
    case 401: return 'Invalid credentials. Please log in again.';
    case 403: return 'You do not have permission to perform this action.';
    case 404: return 'The requested resource was not found.';
    case 429: return 'Too many requests. Please slow down.';
    case 500: return 'Server error. Please try again later.';
    default:  return `Request failed with status ${status}.`;
  }
}

export default axiosClient;
