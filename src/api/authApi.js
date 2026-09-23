// src/api/authApi.js
import axiosClient from './axiosClient';

/**
 * Login with username and password.
 * Returns user data including token on success.
 */
export const loginUser = async ({ username, password }) => {
  const response = await axiosClient.post('/auth/login', {
    username,
    password,
    expiresInMins: 60,
  });
  return response.data;
};

/**
 * Fetch the authenticated user's profile.
 * Requires valid token set in axiosClient interceptor.
 */
export const fetchCurrentUser = async () => {
  const response = await axiosClient.get('/auth/me');
  return response.data;
};
