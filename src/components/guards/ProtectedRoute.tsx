import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

interface Props {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user) {
    const userRoles = user.roles || [user.role];
    const hasAccess = allowedRoles.some(r => userRoles.includes(r));
    if (!hasAccess) {
      return <Navigate to={user.role === 'citizen' ? '/app' : '/admin'} replace />;
    }
  }

  return <>{children}</>;
}
