import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://erp-backend-0ab5.onrender.com',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('branchToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginPage = window.location.pathname === '/';
      if (!isLoginPage) {
        localStorage.clear();
        window.location.href = '/';
      }
    }
    if (error.response?.status === 403) {
      console.warn('Access denied:', error.response?.data?.message);
    }
    return Promise.reject(error);
  }
);

export default api;
