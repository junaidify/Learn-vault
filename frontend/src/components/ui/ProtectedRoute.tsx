import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../lib/types';

interface Props {
  children: React.ReactNode;
  /** If set, only these roles can access the route. */
  allowedRoles?: Role[];
}

/**
 * Route guard.
 *
 * - Redirects to /login if the user is not authenticated.
 * - Redirects to / if the user's role isn't in `allowedRoles`.
 */
export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
