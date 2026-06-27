import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";

import { ROUTES } from "@/api/constants/constants";

import LoadingScreen from "@components/ui/feedback/LoadingScreen";

interface ProtectedRouteProps {
  children: React.ReactNode;
  isBusiness?: boolean;
  isAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  isBusiness,
  isAdmin,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }
  // usar UseNavigate

  if (!user) {
    return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
  }

  if (isAdmin && user.role !== "ADMIN") {
    return <Navigate to={ROUTES.PUBLIC.HOME} replace />;
  }

  if (isBusiness === true && user.is_business === false) {
    return <Navigate to={ROUTES.USER.DASHBOARD} replace />;
  }

  if (isBusiness === false && user.is_business === true) {
    return <Navigate to={ROUTES.LOCAL.DASHBOARD} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
