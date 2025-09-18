import React, { useState } from "react";
import type { ReactNode } from "react";

import Navbar from "../layout/navbar/Navbar";
import HeaderUSER from "../layout/navbar/NavbarUI";
import BusinessSidebar from "../components/locals/UISidebarLocal";
import Footer from "../layout/footer/Footer";

import { useAuth } from "../hooks/useAuth";
import { useDynamicTitle } from "../hooks/useDynamicTitle";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useDynamicTitle();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <>
      {/* Navbar */}
      {user ? (
        <HeaderUSER 
          isBusiness={user.isBusiness} 
          onToggleSidebar={user.isBusiness ? toggleSidebar : undefined}
        />
      ) : (
        <Navbar />
      )}
      
      {/* Sidebar para business */}
      {user?.isBusiness && (
        <BusinessSidebar 
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      )}
      
      {/* Contenido con transición suave */}
      <div className={user?.isBusiness ? 
        `transition-all duration-300 pt-[60px] ${sidebarCollapsed ? 'ml-16' : 'ml-64'}` : 
        ''
      }>
        {children}
      </div>
      
      {!loading && !user && <Footer />}
    </>
  );
};

export default Layout;