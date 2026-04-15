// src/auth/tokenUtils.ts
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
  sub: string;
  role?: string;
}

export const getToken = () => localStorage.getItem('token');

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

export const getUsername = (): string | null => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload?.sub ?? null;
  } catch {
    return null;
  }
};
