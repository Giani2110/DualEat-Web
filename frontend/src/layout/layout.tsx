import React, { useState } from "react";
import type { ReactNode } from "react";

import Navbar from "../layout/navbar/Navbar";
import HeaderUSER from "../layout/navbar/NavbarUI";
import BusinessSidebar from "../components/locals/UISidebarLocal";
import UIDashboard from "../components/users/UIDashboard";
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
          isSideBarOpen={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
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
    setSidebarCollapsed(!sidebarCollapsed);
  };

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
