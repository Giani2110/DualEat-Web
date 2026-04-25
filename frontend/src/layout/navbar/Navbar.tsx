import React, { useEffect, useState } from "react";

import { Link, useLocation } from "react-router-dom";
import {
  NAVBAR_ROUTES,
  OUT_NAVBAR_ROUTES,
} from "@/api/constants/navbar-routes";
import { ROUTES } from "@/api/constants/constants";

import { Triangle } from "lucide-react";
import Logo from "@assets/images/icon/Logo DualEatRed.png";

const Header: React.FC = () => {
  const location = useLocation();
  const [hideHeader, setHideHeader] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

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



  return (
    <div
      className={`fixed top-0 w-full z-50 pt-6 transition-all duration-300 ${hideHeader && location.pathname !== "/feed"
        ? "-translate-y-full opacity-0"
        : "translate-y-0 opacity-100"
        }`}
    >
      <header
        className={`flex justify-between items-center px-6 py-2 bg-white shadow-sm border border-gray-100 rounded-2xl mx-auto w-[92%] sm:w-[85%] lg:w-[75%] max-w-7xl transition-all duration-300`}
      >
        <Link
          to={ROUTES.PUBLIC.HOME}
          className="flex items-center cursor-pointer"
        >
          <img className="w-[35px] h-[35px]" src={Logo} alt="Logo" />
          <span className="ml-3 text-[17px] text1 Dosis-Bold text-red tracking-tighter">
            DualEat
          </span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8 text4 text-[14px]">
          {NAVBAR_ROUTES.map((route) => (
            <Link
              key={route.label}
              to={route.path}
              className={`text4 hover:text-[#b53325]! transition-all duration-200
              ${location.pathname === route.path ? "text-[#b53325]!" : "text4"
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
