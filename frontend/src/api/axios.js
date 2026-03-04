import axios from 'axios';

// Base URL resolution:
// - Production: leave empty, Nginx proxies /api to backend
// - Dev: if VITE_API_URL is not set, default to http://localhost:5000 to avoid proxy/network issues
export const baseURL = (() => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;
  return import.meta.env.DEV ? 'http://localhost:5000' : '';
})();

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // For FormData (file uploads), don't force JSON content-type
  // Let the browser set it automatically with the boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

// Handle responses and errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 403 || error.response.status === 401) {
        // Trigger UI Alert for Forbidden/Limit messages
        if (error.response.status === 403 && error.response.data?.message) {
          const alertEvent = new CustomEvent('global-alert', {
            detail: { message: error.response.data.message, type: 'error' }
          });
          window.dispatchEvent(alertEvent);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
