import React, { useEffect, useState } from "react";

import { Link, useLocation } from "react-router-dom";
import {
  NAVBAR_ROUTES,
  OUT_NAVBAR_ROUTES,
} from "../../constants/navbar-routes";
import { ROUTES } from "../../constants/constants";

import { Triangle } from "lucide-react";
import Logo from "../../assets/images/Logo_DualEat.png";

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

  if (Object.values(OUT_NAVBAR_ROUTES).includes(location.pathname)) {
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
        <Link
          to={ROUTES.LANDING.HOME}
          className="flex items-center cursor-pointer"
        >
          <div className="w-[45px] h-[45px] bg-red rounded-[10px] flex items-center justify-center">
            <img className="w-[20.60px] h-[22px]" src={Logo} alt="Logo" />
          </div>
          <span className="ml-3 text-[18px] Arvo-Bold text3">DualEat</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8 text4 text-[15px]">
          {NAVBAR_ROUTES.map((route) => (
            <Link
              key={route.label}
              to={route.path}
              className={`text4 hover:text-[#b53325]! transition-all duration-200
              ${
                location.pathname === route.path ? "text-[#b53325]!" : "text4"
              }`}
            >
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center space-x-4 text-[14px] text-white">
          <Link
            to={ROUTES.AUTH.LOGIN}
            className="flex items-center bgsemi-black px-7 py-2 rounded-[10px] hover:bg-gray-800 transform hover:scale-105 transition-all duration-200 "
          >
            <Triangle className="w-[10px] h-[10px] transform rotate-90 fill-white " />
            <p className="ml-2">Iniciar sesión</p>
          </Link>
          <Link
            to={ROUTES.AUTH.REGISTER}
            className="flex items-center space-x-3 bg-red px-6 py-2 rounded-[10px] hover:bg-red-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Triangle className="w-[10px] h-[10px] transform rotate-90 fill-white" />
            <p className="ml-2">Registrarse</p>
          </Link>
        </div>
      </header>
    </div>
  );
};

export default Header;
