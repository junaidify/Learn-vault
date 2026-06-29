import axios from 'axios';

/**
 * Central Axios instance.
 *
 * • `withCredentials: true` on every request so the browser attaches the
 *   HttpOnly `jwt` cookie automatically.
 * • The base URL is empty because the Vite dev server proxies `/api/*`
 *   to the Spring Boot backend (see vite.config.ts).
 */
const api = axios.create({
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
  },
});

/**
 * Response interceptor — redirect to /login on 401.
 *
 * Skips the redirect when the request is already targeting an auth endpoint
 * (signup / login) or when we're already on the login page — prevents
 * infinite redirect loops.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes('/api/v1/auth/') &&
      typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/login') &&
      !window.location.pathname.startsWith('/signup')
    ) {
      // Wipe any in-memory auth state will be handled by AuthContext listener
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
