import axios from 'axios';

// VITE_API_URL wins; in dev fall back to the Vite proxy so we avoid CORS.
const configured = import.meta.env.VITE_API_URL?.trim();
const baseURL = configured || (import.meta.env.DEV ? '/api' : 'https://mern-taskly-todo-7itt.vercel.app/api');

const AUTH_PUBLIC_PATHS = ['/auth/login', '/auth/register'];

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT to every request when a session exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired/invalid sessions globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isPublicAuth = AUTH_PUBLIC_PATHS.some((path) => url.startsWith(path));

    if (error.response?.status === 401 && !isPublicAuth) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
