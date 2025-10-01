import React, { useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

import { ROUTES } from "../../constants/constants";

import LoadingScreen from "../animation/LoadingScreen";

interface RouteProps {
  children: React.ReactNode;
}
const PublicRoute: React.FC<RouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.isBusiness === false) {
      navigate({ pathname: ROUTES.USER.DASHBOARD }, { replace: true });
    } else if (user?.isBusiness === true) {
      navigate({ pathname: ROUTES.LOCAL.DASHBOARD }, { replace: true });
    }
  }, [user, navigate]);

  if (loading || user) {
    return <LoadingScreen isVisible={true} />;
  }

  return <>{children}</>;
};


export default PublicRoute;
