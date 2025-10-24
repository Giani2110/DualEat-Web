import React from "react";
import type { ReactNode } from "react";

import Navbar from "../layout/navbar/Navbar";
import HeaderUSER from "../layout/navbar/NavbarUI";
import BusinessSidebar from "../components/locals/UISidebarLocal";
import UIDashboard from "../components/users/dashboard/UIDashboard";
import Footer from "../layout/footer/Footer";

import { useAuth } from "../hooks/useAuth";
import { useDynamicTitle } from "../hooks/useDynamicTitle";
import { useLocation, matchPath } from "react-router-dom";

import { appRoutes } from "../constants/constants";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Verificar si la ruta actual coincide con alguna ruta válida
  const isValidRoute = appRoutes.some((route) =>
    matchPath(route.path, location.pathname)
  );

  // Es 404 si estamos en /404 o si no es una ruta válida
  const is404 = location.pathname === "/404" || !isValidRoute;

  useDynamicTitle();

  const renderContent = () => {
    if (is404 || !user) {
      return <>{children}</>;
    }

    if (user.isBusiness === false) {
      return <UIDashboard>{children}</UIDashboard>;
    }

    if (user.isBusiness === true) {
      return <BusinessSidebar>{children}</BusinessSidebar>;
    }
  };

  return (
    <>
      {user && !is404 ? <HeaderUSER /> : !is404 && !user && <Navbar />}
      {renderContent()}
      {!loading && !user && <Footer />}
    </>
  );
};

export default Layout;
