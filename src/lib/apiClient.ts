import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT + log
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('REQUEST SENT:', config.method?.toUpperCase(), config.url, config.data ?? '');
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle 401/403
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      // Crisis mode or forbidden — dispatch event so context can react
      window.dispatchEvent(new CustomEvent('crisis-mode-notice', { detail: error.response.data }));
    }
    return Promise.reject(error);
  },
);

export default apiClient;
