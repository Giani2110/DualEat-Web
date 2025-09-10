import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import { ROUTES } from "../constants/constants";

import LoadingScreen from "../components/animation/LoadingScreen";

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

  if (loading) {
    return <LoadingScreen isVisible={true} />;
  }

  const queryParams = new URLSearchParams(location.search);
  const tokenFromUrl = queryParams.get("tempToken");

  if (onlyTempToken) {
    if (tokenFromUrl) {
      return <>{children}</>;
    }
    return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
  }

  if (user) {
    return <>{children}</>;
  }

  return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
};

export default ProtectedRoute;
