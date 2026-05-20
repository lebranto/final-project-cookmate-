// lib/axios.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

function getCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
}


//401 발생할 때 refreshToken을 호출하는 코드
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 &&
        !originalRequest._retry &&
        originalRequest.url !== "/auth/refresh") {
      originalRequest._retry = true;

      try {
        const refreshResponse = await api.post("/auth/refresh");
        const nextToken = refreshResponse.data?.accessToken;

        if (nextToken) {
        localStorage.setItem("accessToken", nextToken)
        window.dispatchEvent(new Event("auth-state-changed"));
        }

      return api(originalRequest);
      
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("authUser");
        window.dispatchEvent(new Event("auth-state-changed"));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);



api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const isRefreshRequest = config.url === '/auth/refresh';

      if (!isRefreshRequest) {
        const token = getCookie('accessToken') || localStorage.getItem('accessToken');

        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
