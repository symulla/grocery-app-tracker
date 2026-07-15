import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, isAuthenticated, user, requireAdmin = false }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
