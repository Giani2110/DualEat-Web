import React, { useEffect } from "react";
import type { ReactNode } from "react";

import Navbar from "@layout/navbar/Navbar";
import HeaderUSER from "@layout/navbar/NavbarUI";
import BusinessSidebar from "@/components/private/locals/UISidebarLocal";
import UIDashboard from "@/components/private/users/ui/UIDashboard";
import Footer from "@layout/footer/Footer";

import { useAuth } from "@hooks/useAuth";
import { useDynamicTitle } from "@hooks/useDynamicTitle";
import { useLocation, matchPath } from "react-router-dom";

import { appRoutes } from "@constants/constants";
import { useChat } from "@/hooks/chat/useChat";
import { getUserChats } from "@/services/chat.api";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { setChats } = useChat();

  // Verificar si la ruta actual coincide con alguna ruta válida
  const isValidRoute = appRoutes.some((route) =>
    matchPath(route.path, location.pathname)
  );

  // Es 404 si estamos en /404 o si no es una ruta válida
  const is404 = location.pathname === "/404" || !isValidRoute;

  useEffect(() => {
    const fetchChats = async () => {
      if (user && user.isBusiness === false) {
        const response = await getUserChats();
        if (response?.success && Array.isArray(response.data)) {
          setChats(response.data);
        } else {
          setChats([]);
        }
      }
    };

    fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useDynamicTitle();

  const renderContent = () => {
    if (is404 || !user) {
      return <>{children}</>;
    }

    if (user.isBusiness === false) {
      return <UIDashboard user={user}>{children}</UIDashboard>;
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
