import React from "react";
import type { ReactNode } from "react";

import Header from "../layout/navbar/Header";
import Footer from "../layout/footer/Footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};

export default Layout;
