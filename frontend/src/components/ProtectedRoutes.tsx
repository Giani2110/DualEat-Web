// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRegister } from '../context/RegisterContext'; // Ajusta la ruta si es necesario

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { data: registerContextData } = useRegister();

  const queryParams = new URLSearchParams(location.search);
  const tokenFromUrl = queryParams.get('tempToken');

  const tokenFromContext = registerContextData?.tempToken;

  // Si no hay token en la URL ni en el contexto, redirigir
  if (!tokenFromUrl && !tokenFromContext) {
    return <Navigate to="/register" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
