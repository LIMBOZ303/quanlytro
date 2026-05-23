import axios from 'axios';
import { getToken, removeToken, removeUser } from '../utils/auth';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isLoginRequest = url.includes('/auth/login');

      if (!isLoginRequest) {
        removeToken();
        removeUser();
        window.location.hash = '#/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
