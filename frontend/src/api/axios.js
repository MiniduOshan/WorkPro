import axios from 'axios';

// Base URL resolution:
// - Production: leave empty, Nginx proxies /api to backend
// - Dev: if VITE_API_URL is not set, default to http://localhost:5000 to avoid proxy/network issues
const BASE_URL = (() => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;
  return import.meta.env.DEV ? 'http://localhost:5000' : '';
})();

const api = axios.create({
  baseURL: BASE_URL,
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
  
  // Log the request for debugging
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL || ''}${config.url}`);
  return config;
});

// Log responses and errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`API Error: ${error.response.status} ${error.config.url}`, error.response.data);
    } else if (error.request) {
      console.error('API Error: No response received', error.request);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
