import React, { useEffect, useRef, useState } from "react";

import { Link, useLocation } from "react-router-dom";
import { OUT_NAVBAR_ROUTES } from "../../constants/navbar-routes";
import { ROUTES } from "../../constants/constants";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";

import { Search, Plus, Bell, Menu } from "lucide-react";
import LogoYellow from "../../assets/images/icon/Logo DualEatYellow.png";
import LogoWhite from "../../assets/images/icon/Logo_DualEat.png";

import { formatShortTime } from "../../utils/compactNumber";

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

  const { notifications, unreadCount, markAsRead } = useNotifications();

  const [openNotifications, setOpenNotifications] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpenNotifications(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenNotifications(false);
    }, 400);
  };

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
      className={`fixed top-0 w-full ${headerBgColor} border-b ${headerBorderColor} h-[60px] px-4 md:px-10 flex items-center justify-between pt-[5px] pb-[5px] z-50 ${
        scrolled ? `${scrolledBgColor} ${headerBorderColor} shadow-md` : ""
      }`}
    >
      {/* Logo y botón hamburguesa - lado izquierdo */}
      <div className="flex items-center">
        {/* Botón hamburguesa para business */}
        {onToggleSidebar && (
          <button
            type="button"
            title="Menu"
            onClick={onToggleSidebar}
            className={`mr-4 p-2 cursor-pointer rounded-lg transition-colors duration-200 ${
              isBusiness ? "hover:bg-gray-800" : "hover:bg-gray-200 md:hidden"
            }`}
          >
            <Menu
              className={`w-[20px] h-[20px] ${
                isBusiness
                  ? "text-gray-400 group-hover:text-white"
                  : "text-black group-hover:text-white"
              }`}
            />
          </button>
        )}

        <Link
          to={isBusiness ? ROUTES.LOCAL.DASHBOARD : ROUTES.USER.DASHBOARD}
          className="flex items-center cursor-pointer"
          tabIndex={-1}
        >
          <img
            className="w-[28px] h-[28px]"
            src={isBusiness ? LogoWhite : LogoYellow}
            alt="Logo"
          />
          <span
            className={`ml-3 hidden md:block text-[20px] Dosis-Bold tracking-[-0.01em] ${textColor}`}
          >
            DualEat
          </span>
        </Link>
      </div>

      {/* Se elimina el buscador para la versión isBusiness */}
      {!isBusiness && (
        <div
          onClick={focusInput}
          className="py-2 px-4 rounded-full flex-[0.7] md:flex-[0.3] cursor-text focus-within:ring-inset focus-within:ring-2 ring-[#e5a657] focus-within:bg-[#faf5f0] bg-[#E5EBEE] hover:bg-[#ebe9df]"
        >
          <form action="" className="flex items-center gap-2">
            <Search size={18} />
            <input
              id="search"
              ref={inputRef}
              type="search"
              placeholder="Buscar posts, recetas en DualEat"
              className="outline-none border-none w-full placeholder:text-[14px] placeholder:tracking-wide placeholder:text-[#707070]"
            />
          </form>
        </div>
      )}

      {/* Iconos del lado derecho */}
      <div className="flex items-center justify-end space-x-1 md:space-x-3 text-[14px]">
        {!isBusiness && (
          <Link
            to={ROUTES.USER.CREATE_POST}
            className="flex items-center justify-center px-2 py-2 gap-[3px] cursor-pointer hover:bg-[#E5EBEE] rounded-3xl"
          >
            <Plus
              color="#4A4947"
              className="w-[24px] h-[24px] md:w-[28px] md:h-[28px]"
              strokeWidth={1.8}
            />
            <span className="text-[15px] text5 tracking-tighter">Crear</span>
          </Link>
        )}

        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Icono de campana */}
          <div className="relative p-2 cursor-pointer group hover:bg-gray-800 rounded-full transition-colors duration-200">
            <Bell
              className="w-[22px] text-[#4A4947] group-hover:text-white h-[22px] md:w-[23px] md:h-[23px]"
              strokeWidth={1.8}
            />
            {unreadCount > 0 && (
              <div className="absolute -top-0 -right-0 w-3 h-3 bg-red rounded-full flex items-center justify-center">
                <span className="text-[9px] text-white font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              </div>
            )}
          </div>

          {/* Dropdown de notificaciones */}
          {openNotifications && (
            <div className="absolute right-0 top-full w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">
                  Notificaciones
                </h3>
              </div>
              <div className="max-h-96 overflow-y-auto pb-5">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No hay notificaciones nuevas
                  </div>
                ) : (
                  notifications.map((notif, index) => (
                    <Link
                      key={index}
                      to={`/post/${notif}`}
                      className={`p-4 flex items-center justify-between gap-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0`}
                      onClick={() => setOpenNotifications(false)}
                    >
                      {notif.metadata?.postURLs?.length > 0 && (
                        <img
                          src={notif.metadata?.postURLs[0]}
                          alt=""
                          className="w-[40px] h-[40px] rounded-full"
                        />
                      )}
                      <div>
                        <p className="text-[14px] text5 Dosis-Bold">
                          {notif.metadata.postTitle}
                        </p>
                        <p className="text-[13px] text4">{notif.message}</p>
                      </div>
                      <span className="text-[13px] text-gray-500">
                        {formatShortTime(new Date(notif.created_at))}
                      </span>
                    </Link>
                  ))
                )}
              </div>

              <button
                type="button"
                title="Marcar como leído"
                onClick={markAsRead}
                className="bg-[#b53325] cursor-pointer text1 w-full py-[6px] text-[12px]"
              >
                <span className="text1 Dosis-Bold text-[15px]">
                  Marcar como leído
                </span>
              </button>
            </div>
          )}
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
      </div>
    </header>
  );
};

export default HeaderUSER;

{
  /**{isBusiness ? (
          <>
            
            <div className="relative p-2 cursor-pointer hover:bg-gray-800 rounded-full transition-colors duration-200">
              <Bell color="white" strokeWidth={1.8} size={20} />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">2</span>
              </div>
            </div>

           
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
              <Plus
                color="#4A4947"
                className="w-[24px] h-[24px] md:w-[28px] md:h-[28px]"
                strokeWidth={1.8}
              />
              <span className="text-[15px] text5 tracking-tighter">
                Crear
              </span>
            </Link>
            <div className="px-2 py-2 cursor-pointer hover:bg-[#E5EBEE] rounded-3xl">
              <Bell
                color="#4A4947"
                className="w-[22px] h-[22px] md:w-[23px] md:h-[23px]"
                strokeWidth={1.8}
              />
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
        )} */
}
