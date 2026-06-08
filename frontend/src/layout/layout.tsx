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
    if (is404 || !user || user.isBusiness === true) {
      return <>{children}</>;
    }

    if (user.role === "ADMIN") {
      return <>{children}</>;
    }

    if (user.isBusiness === false) {
      return <UserSidebar user={user}>{children}</UserSidebar>;
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
