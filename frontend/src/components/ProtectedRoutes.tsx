import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; 

import { ROUTES } from '../constants/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { user, loading } = useAuth(); 

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (user) {
    return <>{children}</>;
  }

  const queryParams = new URLSearchParams(location.search);
  const tokenFromUrl = queryParams.get('tempToken');
  
  if (tokenFromUrl) {
    return <>{children}</>;
  }

  return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
};

export default ProtectedRoute;