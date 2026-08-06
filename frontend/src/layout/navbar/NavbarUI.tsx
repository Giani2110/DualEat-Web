import { Link } from "react-router-dom";
import { ROUTES } from "@/api/constants/constants";
import { useNotifications } from "@/hooks/api/notification/useNotifications";
import { Bell, Menu, MessageCircle, Plus } from "lucide-react";
import Logo from "@assets/icon/Logo_DualEatBlack.png";
import LogoWhite from "@assets/icon/Logo_DualEat.png";
import { useNavigate } from "react-router-dom";
import { usePostCreateStore } from "@/context/store/usePostCreate";

import { motion } from "framer-motion";
import type { UserSessionData } from "@/context/auth/AuthProvider";

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  user: UserSessionData;
}

export default function NavbarUser({ isOpen, setIsOpen, user }: Props) {
  const navigate = useNavigate();

  const { unreadCount } = useNotifications();
  const { clearPost } = usePostCreateStore();

  // ==================== CONSTANTES ====================
  // Colores dinámicos según tipo de usuario
  const headerBgColor = user?.is_business ? "bg-text-3" : "bg-bg-semi-white";

  const toggleNotifications = () => {
    navigate("/notifications");
  };

  return (
    <header
      className={`fixed w-full ${headerBgColor} h-[60px] px-4 md:px-10 flex items-center justify-between py-2 z-50`}
    >
      <motion.div
        animate={{ backgroundPositionX: ["0%", "-200%"] }}
        transition={{ duration: 4, ease: "linear", repeat: Infinity }}
        className="absolute left-0 right-0 h-px bottom-0"
        style={{
          background:
            "linear-gradient(to right, #B53325, #e5a657, #ffba08, #e5a657, #B53325)",
          backgroundSize: "200% 100%",
        }}
      />

      <Link
        to={user?.is_business ? ROUTES.LOCAL.DASHBOARD : ROUTES.USER.DASHBOARD}
        style={{ height: 28, width: 28 }}
        className="flex hidden md:flex items-center cursor-pointer hover:scale-103 transition-transform duration-200"
        tabIndex={-1}
      >
        <img
          className="w-full h-full"
          src={user?.is_business ? LogoWhite : Logo}
          alt="Logo"
        />
      </Link>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden cursor-pointer p-1"
      >
        <Menu size={20} color="#2F2F2F" />
      </button>

      <div className="flex items-center justify-end gap-x-4">
        {!user?.is_business && (
          <div className="flex gap-x-2 items-center">
            <div>
              <Link
                to={ROUTES.USER.CREATE_POST}
                onClick={clearPost}
                className="flex items-center rounded-full justify-center px-3 py-1 gap-x-2 transition-all duration-200 cursor-pointer hover:border-[#e5a657] border border-dashed border-transparent"
              >
                <Plus size={22} color="#2F2F2F" />
                <span className="text-[15px] text-text-4 font-light tracking-tight">
                  Crear
                </span>
              </Link>
            </div>

            <div>
              <Link
                title="Ir a chats"
                to={ROUTES.USER.CHAT}
                className="flex items-center rounded-full justify-center p-2 gap-x-2 transition-all duration-200 cursor-pointer hover:border-[#e5a657] border border-dashed border-transparent"
              >
                <MessageCircle size={18} color="#2F2F2F" />
              </Link>
            </div>
          </div>
        )}

        {/* Notificaciones */}
        <div>
          <button
            type="button"
            onClick={() => toggleNotifications()}
            className={`relative p-2 rounded-full transition-all duration-200 cursor-pointer  border border-dashed ${
              user?.is_business
                ? "hover:border-white "
                : "hover:border-[#e5a657] border-transparent hover:text-[#fff]"
            }`}
          >
            <Bell
              size={20}
              color={`${user?.is_business ? "#fff" : "#2F2F2F"}`}
            />

            {/* Badge de notificaciones no leídas */}
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-[16px] h-[16px] bg-bg-blue-black rounded-full flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              </div>
            )}
          </button>
        </div>

        {/* Botón de perfil */}
        <div>
          <button
            onClick={() => {
              navigate(
                ROUTES.USER.PROFILE(user?.id as string, user?.slug as string),
              );
            }}
            className="p-1 cursor-pointer hover:bg-gray-200 rounded-full transition duration-200"
          >
            {user && (
              <div style={{ height: 32, width: 32 }}>
                <img
                  className="rounded-full w-full h-full object-cover"
                  src={user?.avatar_url || ""}
                  alt="Imagen de perfil"
                />
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
