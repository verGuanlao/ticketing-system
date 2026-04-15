// components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { getUserRole } from './authService';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children: React.ReactNode;
}

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const token = localStorage.getItem('accessToken');
  const role = getUserRole();

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(role ?? '')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
