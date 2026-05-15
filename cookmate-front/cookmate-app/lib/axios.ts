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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await api.post("/auth/refresh");
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
      // 로컬 스토리지에서 먼저 찾아보고, 없으면(||) 쿠키에서 찾습니다!
      const token = getCookie('accessToken') || localStorage.getItem('accessToken') ;
      
      // 토큰을 찾았다면 헤더에 장착!
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;