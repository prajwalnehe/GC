import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, adminOnly = false, tabId }) => {
  const { user, loading, isAdmin, hasTabAccess, getHomePath } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (adminOnly && !isAdmin) return <Navigate to={getHomePath()} replace />;

  if (tabId && !hasTabAccess(tabId)) return <Navigate to={getHomePath()} replace />;

  return children;
};

export default ProtectedRoute;
