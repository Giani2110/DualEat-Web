import React from "react";
import type { ReactNode } from "react";

import Navbar from "@layout/navbar/Navbar";
import HeaderUSER from "@layout/navbar/NavbarUI";
import UserSidebar from "@/components/layout/UserSidebar";
import Footer from "@layout/footer/Footer";

import { useAuth } from "@hooks/useAuth";
import { useDynamicTitle } from "@hooks/useDynamicTitle";
import { matchPath } from "react-router-dom";

import { appRoutes } from "@/api/constants/constants";
import BusinessSidebar from "@/components/layout/UISidebarLocal";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // Verificar si la ruta actual coincide con alguna ruta válida
  const isValidRoute = appRoutes.some((route) =>
    matchPath(route.path, location.pathname),
  );

  // Es 404 si estamos en /404 o si no es una ruta válida
  const is404 = location.pathname === "/404" || !isValidRoute;

  useDynamicTitle();

  const renderContent = () => {
    if (is404 || !user) {
      return <>{children}</>;
    }

    if (user.role === "ADMIN") {
      return <>{children}</>;
    }

    if (user.is_business === false) {
      return <UserSidebar user={user}>{children}</UserSidebar>;
    }
    if (user.is_business === true) {
      return <BusinessSidebar>{children}</BusinessSidebar>;
    }

  };

  return (
    <>
      {user && !is404 && user.role !== "ADMIN" ? (
        <HeaderUSER />
      ) : (
        !is404 && !user && <Navbar />
      )}
      {renderContent()}
      {!loading && !user && <Footer />}
    </>
  );
};

export default Layout;
