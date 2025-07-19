import React, { useEffect } from "react";
import Logo from "../assets/images/Logo_DualEat.png"; // Ajusta la ruta si es necesario
import { Link, useLocation } from "react-router-dom";

const Header: React.FC = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = React.useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={` ${
        location.pathname === "/sobre-nosotros"
          ? "bg-white max-w-[70%] py-[15px] rounded-[15px]"
          : scrolled
          ? "bg-white pt-[40px] pb-[25px] border-b border-gray-200"
          : "bg-transparent pt-[40px] pb-[25px]"
      }  fixed w-full px-4 sm:px-6 lg:px-8 z-50 `}
    >
      <header
        className={`
          ${location.pathname === "/sobre-nosotros"
            ? "max-w-[95%]"
            : "max-w-[85%]"
          }  
           mx-auto w-full flex justify-between items-center'`}
      >
        {/* Logo and Navigation */}
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
          <Link
            to="/sobre-nosotros"
            className="hover:text-[#B53325] duration-200"
          >
            Sobre nosotros
          </Link>
          <Link to="/" className="hover:text-[#B53325] duration-200">
            Funcionalidades
          </Link>
          <Link
            to="/para-negocios"
            className="hover:text-[#B53325] duration-200"
          >
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
