import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";

import { ROUTES } from "@/api/constants/constants";

import LoadingScreen from "@components/ui/feedback/LoadingScreen";

interface RouteProps {
  children: React.ReactNode;
}
const PublicRoute: React.FC<RouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "ADMIN") {
      navigate({ pathname: ROUTES.ADMIN.DASHBOARD }, { replace: true });
    } else if (user?.is_business === false) {
      navigate({ pathname: ROUTES.USER.DASHBOARD }, { replace: true });
    } else if (user?.is_business === true) {
      navigate({ pathname: ROUTES.LOCAL.DASHBOARD }, { replace: true });
    }
  }, [user, navigate]);

  if (loading || user) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};

export default PublicRoute;
