import axios from 'axios';
import { message } from 'antd';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // According to openapi.yml we use http bearer
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      try {
        message.warning('Требуется авторизация');
      } catch (_) {}
      try {
        if (typeof window !== 'undefined') {
          if (window.location.pathname !== '/') {
            window.location.replace('/');
          }
        }
      } catch (_) {}
    }
    return Promise.reject(err);
  }
);

export default api;
