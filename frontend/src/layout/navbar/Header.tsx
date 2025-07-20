import React, { useEffect, useState } from "react";
import Logo from "../../assets/images/Logo_DualEat.png";
import { Link, useLocation } from "react-router-dom";

const Header: React.FC = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setScrolled(currentScrollY > 50);

      // Mostrar header si el usuario scrollea hacia arriba
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setHideHeader(false);
      } else {
        setHideHeader(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  if (location.pathname === "/register" || location.pathname === "/login") {
    return null;
  }

  const transparentPages = [
    "/sobre-nosotros",
    "/changelog",
    "/terminos-y-condiciones",
  ];

  const isTransparentPage = transparentPages.includes(location.pathname);

  return (
    <div
      className={`fixed top-0 w-full z-50 transition-transform duration-300 ease-in-out transform ${
        hideHeader ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
      } ${
        isTransparentPage
          ? "w-full"
          : scrolled
          ? "bg-white pt-[40px] pb-[25px] border-b border-gray-200"
          : "bg-transparent pt-[40px] pb-[25px]"
      }`}
    >
      <header
        className={`flex justify-between items-center px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
          isTransparentPage
            ? "bg-white rounded-[15px] py-[11px] max-w-[65%] mx-auto mt-12"
            : "max-w-[75%] mx-auto"
        }`}
      >
        <div className="flex items-center cursor-pointer">
          <div className="w-[45px] h-[45px] bg-red rounded-[10px] flex items-center justify-center">
            <img
              className="w-4 h-4 text-white font-bold text-sm"
              src={Logo}
              alt="Logo"
            />
          </div>
          <span className="ml-3 text-[18px] font-bold text3">DualEat</span>
        </div>
        <nav className="hidden md:flex items-center space-x-8 text4 text-[15px]">
          <Link to="/sobre-nosotros" className="hover:text-[#B53325] duration-200">
            Sobre nosotros
          </Link>
          <Link to="/" className="hover:text-[#B53325] duration-200">
            Funcionalidades
          </Link>
          <Link to="/para-negocios" className="hover:text-[#B53325] duration-200">
            Para negocios
          </Link>
        </nav>
        <div className="flex items-center space-x-4 text-[14px] text-white">
          <Link
            to="/login"
            className="bgsemi-black px-7 py-2 rounded-[10px] font-medium hover:bg-gray-800 transform hover:scale-105 transition-all duration-200 hidden md:block"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/register"
            className="bg-red px-6 py-2 rounded-[10px] font-medium hover:bg-red-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Registrarse
          </Link>
        </div>
      </header>
    </div>
  );
};

export default Header;
