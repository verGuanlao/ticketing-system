import { API_BASE_URL } from '../config/apiConfig';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
  sub: string;
  role?: string;
}

export const getToken = () => localStorage.getItem('accessToken');

export const isTokenValid = (): boolean => {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded: JwtPayload = jwtDecode(token);
    return decoded.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};

export const getCurrentUser = (): JwtPayload | null => {
  const token = getToken();
  if (!token) return null;
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && isTokenValid()) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Catch if token is expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      localStorage.removeItem('accessToken');
      sessionStorage.setItem('redirectMessage', 'Session expired. Please log in again.');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
