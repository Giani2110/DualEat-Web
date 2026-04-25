import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";

import { ROUTES } from "@/api/constants/constants";

import LoadingScreen from "../../animation/LoadingScreen";

interface ProtectedRouteProps {
  children: React.ReactNode;
  onlyTempToken?: boolean;
  isBusiness?: boolean;
  isAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  onlyTempToken = false,
  isBusiness,
  isAdmin,
}) => {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen isVisible={true} />;
  }

  const queryParams = new URLSearchParams(location.search);
  const tokenFromUrl = queryParams.get("tempToken");

  if (onlyTempToken) {
    return tokenFromUrl ? (
      <>{children}</>
    ) : (
      <Navigate to={ROUTES.AUTH.LOGIN} replace />
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
  }

  if (isAdmin && user.role !== "ADMIN") {
    return <Navigate to={ROUTES.PUBLIC.HOME} replace />;
  }

  if (isBusiness === true && user.isBusiness === false) {
    return <Navigate to={ROUTES.USER.DASHBOARD} replace />;
  }

  if (isBusiness === false && user.isBusiness === true) {
    return <Navigate to={ROUTES.LOCAL.DASHBOARD} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
