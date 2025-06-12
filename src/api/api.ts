import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import type { RefreshSessionRequest, RefreshSessionResponse } from './types';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = 'Bearer ' + token;
              }
              resolve(api(originalRequest));
            },
            reject: (err: AxiosError) => reject(err),
          });
        });
      }

      isRefreshing = true;
      const refresh_token = localStorage.getItem('refresh_token');

      if (!refresh_token) {
        return Promise.reject(error);
      }

      try {
        const res = await axios.post<RefreshSessionResponse>(`${baseURL}/auth/refresh`, {
          refresh_token,
        });

        const newAccessToken = res.data.access_token;
        localStorage.setItem('access_token', newAccessToken);
        localStorage.setItem('refresh_token', res.data.refresh_token);

        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        }

        return api(originalRequest);
      } catch (err) {
        processQueue(err as AxiosError, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
