import React, { useEffect, useRef } from "react";

import { Link, useLocation } from "react-router-dom";
import { OUT_NAVBAR_ROUTES } from "../../constants/navbar-routes";
import { ROUTES } from "../../constants/constants";
import { useAuth } from "../../hooks/useAuth";

import { Search, Plus, Bell, Menu } from "lucide-react";
import LogoYellow from "../../assets/images/icon/Logo DualEatYellow.png";
import LogoWhite from "../../assets/images/icon/Logo_DualEat.png";

interface HeaderUSERProps {
  isBusiness?: boolean;
  onToggleSidebar?: () => void;
}

const HeaderUSER: React.FC<HeaderUSERProps> = ({
  isBusiness = false,
  onToggleSidebar,
}) => {
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [scrolled, setScrolled] = React.useState(false);
  const { user } = useAuth();

  const focusInput = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (Object.values(OUT_NAVBAR_ROUTES).includes(location.pathname)) {
    return null;
  }

  // Se ajustan los colores para la versión isBusiness
  const headerBgColor = isBusiness ? "bg-gray-900" : "bg-[#fcfcfc]";
  const headerBorderColor = isBusiness ? "border-gray-700" : "border-[#e5a657]";
  const scrolledBgColor = isBusiness ? "bg-gray-900" : "bg-white";
  const textColor = isBusiness ? "text-white" : "text-yellow";

  return (
    <header
      className={`fixed top-0 w-full ${headerBgColor} border-b ${headerBorderColor} h-[60px] px-10 flex items-center justify-between pt-[5px] pb-[5px] z-50 ${
        scrolled ? `${scrolledBgColor} ${headerBorderColor} shadow-md` : ""
      }`}
    >
      {/* Logo y botón hamburguesa - lado izquierdo */}
      <div className="flex items-center">
        {/* Botón hamburguesa para business */}
        {isBusiness && onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="mr-4 p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200"
          >
            <Menu className="w-[20px] h-[20px] text-gray-400 group-hover:text-white" />
          </button>
        )}

        <Link
          to={isBusiness ? ROUTES.LOCAL.DASHBOARD : ROUTES.PUBLIC.HOME}
          className="flex items-center cursor-pointer"
          tabIndex={-1}
        >
          <img
            className="w-[28px] h-[28px]"
            src={isBusiness ? LogoWhite : LogoYellow}
            alt="Logo"
          />
          <span
            className={`ml-3 text-[17px] Arvo-Bold tracking-[-0.01em] ${textColor}`}
          >
            DualEat
          </span>
        </Link>
      </div>

      {/* Se elimina el buscador para la versión isBusiness */}
      {!isBusiness && (
        <div
          onClick={focusInput}
          className="py-2 px-4 rounded-full cursor-text focus-within:ring-inset focus-within:ring-2 ring-[#e5a657] focus-within:bg-[#faf5f0] bg-[#E5EBEE] hover:bg-[#ebe9df]"
        >
          <form action="" className="flex items-center gap-2">
            <Search className="w-[16px] h-[16px]" />
            <input
              id="search"
              ref={inputRef}
              type="search"
              placeholder="Buscar posts, recetas en DualEat"
              className="outline-none border-none w-full placeholder:text-[13px] placeholder:tracking-wide placeholder:text-[#707070]"
            />
          </form>
        </div>
      )}

      {/* Iconos del lado derecho */}
      <div className="flex items-center justify-end space-x-3 text-[14px]">
        {isBusiness ? (
          <>
            {/* Icono de notificaciones con badge */}
            <div className="relative p-2 cursor-pointer hover:bg-gray-800 rounded-full transition-colors duration-200">
              <Bell color="white" strokeWidth={1.8} size={20} />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">2</span>
              </div>
            </div>

            {/* Avatar del usuario */}
            <div className="p-1 cursor-pointer hover:bg-gray-800 rounded-full transition-colors duration-200">
              {user && (
                <img
                  className="w-[30px] h-[30px] rounded-full border-2 border-white/20"
                  src={user?.avatar_url || ""}
                  alt="User avatar"
                />
              )}
            </div>
          </>
        ) : (
          <>
            <Link
              to={ROUTES.USER.CREATE_POST}
              className="flex items-center justify-center px-2 py-2 gap-[3px] cursor-pointer hover:bg-[#E5EBEE] rounded-3xl"
            >
              <Plus color="#4A4947" strokeWidth={1.8} size={24} />
              <span className="text-[13px] Arvo text5 tracking-tighter">
                Crear
              </span>
            </Link>
            <div className="px-2 py-2 cursor-pointer hover:bg-[#E5EBEE] rounded-3xl">
              <Bell color="#4A4947" strokeWidth={1.8} size={22} />
            </div>
            <div className="p-1 cursor-pointer hover:bg-[#E5EBEE] rounded-3xl ">
              {user && (
                <img
                  className="w-[30px] h-[30px] rounded-full"
                  src={user?.avatar_url || ""}
                  alt=""
                />
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default HeaderUSER;