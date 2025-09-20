import React from "react";
import type { ReactNode } from "react";

import Navbar from "../layout/navbar/Navbar";
import NavbarUI from "../layout/navbar/NavbarUI";
import Footer from "../layout/footer/Footer";

import { useAuth } from "../hooks/useAuth";
import { useDynamicTitle } from "../hooks/useDynamicTitle";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, loading } = useAuth();
  useDynamicTitle();
  return (
    <>
      {user ? <NavbarUI /> : <Navbar />}
      {children}
      {!loading && !user && <Footer />}
    </>
  );
};

export default Layout;
