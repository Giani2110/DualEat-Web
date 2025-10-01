import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";

import Navbar from "../layout/navbar/Navbar";
import HeaderUSER from "../layout/navbar/NavbarUI";
import BusinessSidebar from "../components/locals/UISidebarLocal";
import UIDashboard from "../components/users/dashboard/UIDashboard";
import Footer from "../layout/footer/Footer";

import { useAuth } from "../hooks/useAuth";
import { useDynamicTitle } from "../hooks/useDynamicTitle";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  useDynamicTitle();

  const renderContent = () => {
    if (!user) {
      return <>{children}</>;
    }

    if (user.isBusiness === false) {
      return (
        <UIDashboard
          toggleSidebar={toggleSidebar}
          isSidebarOpen={!sidebarCollapsed}
        >
          {children}
        </UIDashboard>
      );
    }

    if (user.isBusiness === true) {
      return (
        <BusinessSidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        >
          {children}
        </BusinessSidebar>
      );
    }
  };

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem("sidebarOpen", sidebarCollapsed ? "true" : "false");
  };

  useEffect(() => {
    const stored = localStorage.getItem("sidebarOpen");
    setSidebarCollapsed(stored === "false");
  }, []);

  return (
    <>
      {user ? (
        <HeaderUSER
          isBusiness={user.isBusiness}
          onToggleSidebar={toggleSidebar}
        />
      ) : (
        <Navbar />
      )}
      
      {renderContent()}

      {!loading && !user && <Footer />}
    </>
  );
};

export default Layout;
