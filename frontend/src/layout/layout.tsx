import React, { useEffect, useState } from "react";
import type { ReactNode } from "react";

import Navbar from "@layout/navbar/Navbar";
import NavbarUser from "@layout/navbar/NavbarUI";
import UserSidebar from "@/components/layout/UserSidebar";
import Footer from "@layout/footer/Footer";

import { useAuth } from "@hooks/useAuth";
import { useDynamicTitle } from "@hooks/useDynamicTitle";
import { matchPath } from "react-router-dom";

import { appRoutes } from "@/api/constants/constants";
import BusinessSidebar from "@/components/layout/UISidebarLocal";
import { useScroll, useSpring, motion } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, loading } = useAuth();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { damping: 15, stiffness: 100 });

  const [isOpen, setIsOpen] = useState<boolean>(
    localStorage.getItem("sidebar") === "true",
  );

  useEffect(() => {
    localStorage.setItem("sidebar", String(isOpen));
  }, [isOpen]);

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
      return (
        <UserSidebar isOpen={isOpen} setIsOpen={setIsOpen} user={user}>
          {children}
        </UserSidebar>
      );
    }
    if (user.is_business === true) {
      return <BusinessSidebar>{children}</BusinessSidebar>;
    }
  };

  return (
    <>
      {!user && (
        <motion.div
          style={{ scaleX: scaleX, originX: 0, height: 2 }}
          className="fixed gradient top-0 w-full z-50"
        />
      )}

      {user && user.role !== "ADMIN" ? (
        <NavbarUser isOpen={isOpen} setIsOpen={setIsOpen} user={user} />
      ) : (
        !user && <Navbar />
      )}
      {renderContent()}
      {!loading && !user && <Footer />}
    </>
  );
};

export default Layout;
