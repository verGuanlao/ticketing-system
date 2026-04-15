export const getUserRole = (): string | null => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;

  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.role;
};

export const logout = () => {
  localStorage.removeItem('accessToken');
};
