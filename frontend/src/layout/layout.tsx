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
  const { user } = useAuth();
  useDynamicTitle();
  return (
    <>
     {user ? <NavbarUI /> : <Navbar />}
      {children}
      <Footer />
    </>
  );
};

export default Layout;
