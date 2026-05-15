// lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api', // 백엔드 주소
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
        localStorage.setItem("accessToken", nextToken);
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