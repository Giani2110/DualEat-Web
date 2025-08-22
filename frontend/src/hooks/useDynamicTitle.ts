import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { ROUTES } from "../constants/constants";

export const useDynamicTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const titles: Record<string, string> = {
      [ROUTES.AUTH.LOGIN]: "Iniciar sesión - DualEat",
      [ROUTES.AUTH.REGISTER]: "Registrarse - DualEat",
      [ROUTES.AUTH.ONBOARDING]: "Completa tu perfil - DualEat",
    };

    document.title = titles[location.pathname] || "DualEat";
  }, [location.pathname]);
};
