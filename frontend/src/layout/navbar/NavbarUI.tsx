import { Link } from "react-router-dom";
import { ROUTES } from "@/api/constants/constants";
import { useAuth } from "@hooks/useAuth";
import { useNotifications } from "@hooks/useNotifications";
import { Bell, MessageCircle, Plus, Search } from "lucide-react";
import LogoYellow from "@assets/images/icon/Logo_DualEatYellow.png";
import LogoWhite from "@assets/images/icon/Logo_DualEat.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { Community, Post, PostComment, Recipe } from "@/interface/global";
import { usePostCreateStore } from "@/context/store/usePostCreate";

type GlobalSearch = Post | Recipe | PostComment | Community;

const TABS = ["posts", "recipes", "comments", "communities"] as const;

type TabType = (typeof TABS)[number];

const TAB_LABELS: Record<TabType, string> = {
  posts: "Posts",
  recipes: "Recetas",
  comments: "Comentarios",
  communities: "Comunidades",
} as const;

export default function HeaderUSER() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const { notifications, unreadCount } = useNotifications();
  const { clearPost } = usePostCreateStore();

  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const [tab, setTab] = useState<TabType>("posts");

  // ==================== CONSTANTES ====================
  // Colores dinámicos según tipo de usuario
  const headerBgColor = user?.is_business ? "bg-gray-900" : "bg-bg-semi-white";
  const headerBorderColor = user?.is_business
    ? "border-gray-700"
    : "border-[#e5a657]";

  const toggleNotifications = () => {
    navigate("/notifications");
  };

  const handleSubmit = () => {
    navigate(`/search?q=${query}&tab=${tab}`);
  };

  const isOpen = focused && query.length > 0;

  return (
    <header
      className={`fixed w-full ${headerBgColor} border-b ${headerBorderColor} h-[60px] px-4 md:px-10 flex items-center justify-between py-2 z-50`}
    >
      <div style={{ flex: 1 }} className="flex items-center">
        {/* Logo y título */}
        <Link
          to={
            user?.is_business ? ROUTES.LOCAL.DASHBOARD : ROUTES.USER.DASHBOARD
          }
          className="flex items-center cursor-pointer hover:scale-103 transition-transform duration-200"
          tabIndex={-1}
        >
          <img
            className="w-[28px] h-[28px]"
            src={user?.is_business ? LogoWhite : LogoYellow}
            alt="Logo"
          />
        </Link>
      </div>

      <div style={{ flex: 2 }}>
        {!user?.is_business && (
          <div className="relative w-full">
            {/* Barra de búsqueda (Input) */}
            <div
              className={`w-full px-3 flex items-center gap-x-2 justify-start border border-gray-300 
                ${
                  isOpen
                    ? "shadow-lg rounded-[20px] rounded-b-none border-b-transparent"
                    : "rounded-full hover:border-dashed hover:border-[#e5a657]"
                }`}
            >
              <Search className="text-text-3" size={20} />

              <input
                type="text"
                title="Buscar en DualEat"
                onFocus={() => setFocused(true)}
                onBlur={() => {
                  setFocused(false);
                }}
                value={query}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar en DualEat"
                className="w-full py-2 font-normal text-[15px] text-text-3 h-full outline-none"
              />
            </div>

            {isOpen && (
              <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-b-[20px] shadow-lg max-h-[80vh] overflow-y-auto z-50 py-4 px-3 flex flex-col gap-y-4">
                {/* Sección: Sugerencias de texto */}

                {/* Sección: Comunidades */}

                {/* Sección: Perfiles */}
              </div>
            )}
          </div>
        )}
      </div>

      <div
        style={{ flex: 1 }}
        className="flex items-center justify-end gap-x-4"
      >
        {!user?.is_business && (
          <div className="flex gap-x-2 items-center">
            <div>
              <Link
                to={ROUTES.USER.CREATE_POST}
                onClick={clearPost}
                className="flex items-center rounded-full justify-center px-3 py-1 gap-x-2 transition-all duration-200 cursor-pointer hover:bg-gray-50 hover:border-[#e5a657] border border-dashed border-transparent"
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
                className="flex items-center rounded-full justify-center p-2 gap-x-2 transition-all duration-200 cursor-pointer hover:bg-gray-50 hover:border-[#e5a657] border border-dashed border-transparent"
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
            className={`relative p-2 rounded-full transition-all duration-200 cursor-pointer hover:bg-gray-50 hover:border-[#e5a657] border border-dashed ${
              user?.is_business
                ? "border-[#333333] text-[#fff] hover:border-white"
                : "border-transparent text-[#878787] hover:text-[#fff]"
            }`}
          >
            <Bell size={20} color="#2F2F2F" />

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
              <div style={{ height: 32, width: 32 }} className="">
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
