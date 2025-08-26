import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingScreen from '../components/animation/LoadingScreen';
import { ROUTES } from '../constants/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onlyTempToken?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  onlyTempToken = false,
}) => {
  const location = useLocation();
  const { user, loading } = useAuth();

  // 1. If loading is true, always display the loading screen.
  //    This prevents any premature redirection.
  if (loading) {
    return <LoadingScreen isVisible={true} />;
  }

  const queryParams = new URLSearchParams(location.search);
  const tokenFromUrl = queryParams.get('tempToken');

  // 2. Logic for routes that only need a temp token
  if (onlyTempToken) {
    if (tokenFromUrl) {
      return <>{children}</>;
    }
    // No temp token found, redirect
    return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
  }

  // 3. Normal behavior for routes that require a user
  //    The `user` state should be available here because `loading` is false.
  if (user) {
    return <>{children}</>;
  }

  // No user found, redirect
  return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
};

export default ProtectedRoute;