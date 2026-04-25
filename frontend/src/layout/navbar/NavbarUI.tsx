import { useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { OUT_NAVBAR_ROUTES } from "@/api/constants/navbar-routes";
import { ROUTES } from "@/api/constants/constants";
import { useAuth } from "@hooks/useAuth";
import { useCommunity } from "@hooks/useUCommunity";
import { useNotifications } from "@hooks/useNotifications";
import {
  Search,
  Plus,
  Menu,
  X,
  ChevronUp,
  LogOut,
  ChevronDown,
} from "lucide-react";
import LogoYellow from "@assets/images/icon/Logo DualEatYellow.png";
import LogoWhite from "@assets/images/icon/Logo_DualEat.png";
import CommunityModal from "@components/modal/CommunityModal";
import type { Notification } from "@interface/global";
import { useNavigate } from "react-router-dom";
import { formatShortTime } from "@utils/compactNumber";
import { useChat } from "@/hooks/chat/useChat";
import { useRecent, type MinimalCommunityPlus } from "@/hooks/useRecent";

const HeaderUSER = () => {
  // ==================== HOOKS ====================
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { userCommunities } = useCommunity();

  const { recents, handleCommunityClick } = useRecent(user?.id);
  const { notifications, unreadCount, markAsRead, markAsReadSingle } =
    useNotifications();
  const { chats, setChatID } = useChat();

  // ==================== ESTADOS ====================
  const [communityOpen, setCommunityOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatsOpen, setChatsOpen] = useState(true);
  const [createCommunityModalOpen, setCreateCommunityModalOpen] =
    useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [recentsOpen, setRecentsOpen] = useState(true);

  // ==================== REFS ====================
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ==================== CONSTANTES ====================

  // Colores dinámicos según tipo de usuario
  const headerBgColor = user?.isBusiness ? "bg-gray-900" : "bg-[#fdfdfd]";
  const headerBorderColor = user?.isBusiness
    ? "border-gray-700"
    : "border-[#e5a657]";
  const textColor = user?.isBusiness ? "text-white" : "text-yellow";

  // ==================== EFECTOS ====================
  // Detectar scroll

  // ==================== HANDLERS ====================
  // Manejo de hover en notificaciones
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

  // Click en notificación individual
  const handleNotificationClick = (notification: Notification) => {
    if (
      notification.metadata.slugs &&
      notification.metadata.type === "comment"
    ) {
      markAsReadSingle(notification.id);
      navigate(
        "/c/" +
        notification.metadata.slugs.community +
        "/post/" +
        notification.metadata.slugs.user +
        "/" +
        notification.metadata.slugs.post,
      );
    } else {
      markAsReadSingle(notification.id);
      navigate("/c/" + notification.metadata.slugs.community);
    }
  };

  // Toggle del panel de notificaciones
  const toggleNotifications = () => {
    navigate("/notifications");
    setOpenNotifications(!openNotifications);
  };

  // Cerrar sesión
  const handleLogout = () => {
    logout();
  };

  // ==================== UTILIDADES ====================
  // Obtener label de navegación según pathname
  const getNavLabel = (pathname: string): string => {
    if (pathname.startsWith(ROUTES.USER.DASHBOARD)) return "Inicio";
    if (pathname.startsWith(ROUTES.USER.EXPLORE)) return "Explorar";
    if (pathname.startsWith(ROUTES.USER.RECIPES)) return "Recetas";
    if (pathname.startsWith(ROUTES.USER.COMMUNITY)) return "Comunidad";
    if (pathname.startsWith(ROUTES.USER.NOTIFICATIONS)) return "Notificaciones";
    if (pathname.startsWith(ROUTES.USER.CREATE_POST)) return "Post";

    if (pathname.startsWith(ROUTES.LOCAL.DASHBOARD)) return "Dashboard";
    if (pathname.startsWith(ROUTES.LOCAL.CALENDAR)) return "Calendario";
    if (pathname.startsWith(ROUTES.LOCAL.MENU)) return "Menú";
    if (pathname.startsWith(ROUTES.LOCAL.QR)) return "QR";
    if (pathname.startsWith(ROUTES.LOCAL.REVIEWS)) return "Reseñas";
    if (pathname.startsWith(ROUTES.LOCAL.SETTINGS)) return "Ajustes";

    return "";
  };

  // ==================== RENDERIZADO CONDICIONAL ====================
  // No mostrar header en ciertas rutas
  if (Object.values(OUT_NAVBAR_ROUTES).includes(location.pathname)) {
    return null;
  }

  // ==================== CONTENIDO DEL SIDEBAR ====================
  const sidebarContent = (
    // Sidebar para usuarios regulares
    <>
      <div className="flex flex-col gap-1 h-full">
        {/* Inicio */}
        <button
          type="button"
          title="Inicio"
          onClick={() => {
            setSidebarOpen(false);
            navigate(ROUTES.USER.DASHBOARD);
          }}
          className={`navlis`}
        >
          {location.pathname === ROUTES.USER.DASHBOARD && (
            <div className="w-1 h-[80%] rounded-[10px] bg-[#e5a657]"></div>
          )}

          <div
            className={`navlis ms-2 w-full rounded-[5px] text5 cursor-pointer px-[8px] py-[5px]  ${location.pathname === ROUTES.USER.DASHBOARD
              ? "bg-[#e4e4e4] Dosis-Bold hover:bg-[#e9e9e9]"
              : "ms-3 hover:bg-[#f8f8f8]"
              } `}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#83898f"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-house-icon lucide-house"
            >
              <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
              <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            <span className={`ml-3 text-[15px]`}>Inicio</span>
          </div>
        </button>

        {/* Explorar */}
        <button
          type="button"
          title="Explorar comunidades"
          onClick={() => {
            setSidebarOpen(false);
            navigate(ROUTES.USER.EXPLORE);
          }}
          className={`navlis`}
        >
          {location.pathname === ROUTES.USER.EXPLORE && (
            <div className="w-1 h-[80%] rounded-[10px] bg-[#e5a657]"></div>
          )}

          <div
            className={`navlis ms-2 w-full rounded-[5px] text5 cursor-pointer px-[8px] py-[5px]  ${location.pathname === ROUTES.USER.EXPLORE
              ? "bg-[#e4e4e4] Dosis-Bold hover:bg-[#e9e9e9]"
              : "ms-3 hover:bg-[#f8f8f8]"
              } `}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#83898f"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-users-round-icon lucide-users-round"
            >
              <path d="M18 21a8 8 0 0 0-16 0" />
              <circle cx="10" cy="8" r="5" />
              <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" />
            </svg>
            <span className={`ml-3 text-[15px]`}>Explorar</span>
          </div>
        </button>

        {/* Recetas */}
        <button
          type="button"
          title="Explorar recetas"
          onClick={() => {
            setSidebarOpen(false);
            navigate(ROUTES.USER.RECIPES);
          }}
          className={`navlis`}
        >
          {location.pathname === ROUTES.USER.RECIPES && (
            <div className="w-1 h-[80%] rounded-[10px] bg-[#e5a657]"></div>
          )}

          <div
            className={`navlis ms-2 w-full rounded-[5px] text5 cursor-pointer px-[8px] py-[5px]  ${location.pathname === ROUTES.USER.RECIPES
              ? "bg-[#e4e4e4] Dosis-Bold hover:bg-[#e9e9e9]"
              : "ms-3 hover:bg-[#f8f8f8]"
              } `}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#83898f"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-cooking-pot-icon lucide-cooking-pot"
            >
              <path d="M2 12h20" />
              <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" />
              <path d="m4 8 16-4" />
              <path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8" />
            </svg>
            <span className={`ml-3 text-[15px]`}>Recetas</span>
          </div>
        </button>

        <div className="w-full h-[1px] border-t border-[#dbdbdb] mt-3" />

        <div className="flex flex-col h-full">
          {/* Recientes */}
          <div className={`px-2 ${recentsOpen ? "flex-[0.5]" : "flex-0"}`}>
            <div
              onClick={() => setRecentsOpen(!recentsOpen)}
              className="w-full flex items-center justify-between mb-2 mt-3 px-2 cursor-pointer hover:bg-[#f8f8f8] py-2 rounded-[5px]"
            >
              <h3 className="text-[13px] text4 tracking-wide Dosis-Bold ">
                Recientes
              </h3>
              <ChevronUp
                size={18}
                color="#333333"
                className={`transition-transform duration-300 ${recentsOpen ? "rotate-0" : "rotate-180"
                  } `}
              />
            </div>
            {recentsOpen && (
              <>
                {recents.length > 0 &&
                  recents.map((community) => (
                    <button
                      type="button"
                      key={community.id}
                      title={community.name}
                      onClick={() => {
                        setSidebarOpen(false);
                        handleCommunityClick(community);
                      }}
                      className="navlis flex-[1] rounded-[8px] cursor-pointer w-full py-[5px] px-2 hover:bg-[#e9e9e9]"
                    >
                      <img
                        src={
                          community.image_url ??
                          "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultCommunity.jpg"
                        }
                        className="rounded-full h-4 w-4 flex-shrink-0"
                        alt="Imagen de la comunidad"
                      />
                      <span className="ml-[10px] text-[14px] text5 whitespace-nowrap">
                        {community.name}
                      </span>
                    </button>
                  ))}
              </>
            )}
          </div>

          <div className="w-full h-[1px] border-t border-[#dbdbdb] mt-2" />

          {/* Comunidades */}
          <div className={`px-2 ${communityOpen ? "flex-2" : "flex-0"}`}>
            <div
              onClick={() => setCommunityOpen(!communityOpen)}
              className="w-full flex items-center justify-between mb-2 mt-4 px-2 cursor-pointer hover:bg-[#f8f8f8] py-2 rounded-[5px]"
            >
              <h3 className="text-[13px] text4 tracking-wide Dosis-Bold">
                Comunidades
              </h3>
              <ChevronUp
                size={18}
                color="#333333"
                className={`transition-transform duration-300 ${communityOpen ? "rotate-0" : "rotate-180"
                  } `}
              />
            </div>

            {/* Lista de comunidades */}
            {communityOpen && (
              <>
                {/* Botón crear comunidad */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCreateCommunityModalOpen(!createCommunityModalOpen);
                  }}
                  type="button"
                  className={`navlis hover:bg-[#e9e9e9] cursor-pointer w-full py-[5px] px-1 mb-2 border-t border-dashed border-b border-[#dbdbdb]`}
                >
                  <Plus
                    className="flex-shrink-0"
                    color="#e5a657"
                    size={20}
                    strokeWidth={1.7}
                  />
                  <span
                    className={`ml-[14px] text5 text-[14px] whitespace-nowrap`}
                  >
                    Crear comunidad
                  </span>
                </button>

                {/* Listado de comunidades del usuario */}
                {userCommunities.map((community) => {
                  const communityInfo = {
                    id: community.community.id,
                    name: community.community.name,
                    image_url: community.community.image_url,
                    slug: community.community.slug,
                  };
                  return (
                    <button
                      type="button"
                      key={community.community.id}
                      title={community.community.name}
                      onClick={() => {
                        setSidebarOpen(false);
                        handleCommunityClick(
                          communityInfo as MinimalCommunityPlus,
                        );
                      }}
                      className="navlis flex-[1] rounded-[8px] cursor-pointer w-full py-[5px] px-2 hover:bg-[#e9e9e9]"
                    >
                      <img
                        src={
                          community.community.image_url ??
                          "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultCommunity.jpg"
                        }
                        className="rounded-full h-4 w-4 flex-shrink-0"
                        alt="Imagen de la comunidad"
                      />
                      <span className="ml-[10px] text-[14px] text5 whitespace-nowrap">
                        {community.community.name}
                      </span>
                    </button>
                  );
                })}
              </>
            )}
          </div>

          <div className="w-full h-[1px] border-t border-[#dbdbdb] mt-2" />

          {/* Chats */}
          <div className={`px-2 ${chatsOpen ? "flex-[0.5]" : "flex-0"}`}>
            <div
              onClick={() => setChatsOpen(!chatsOpen)}
              className="-full flex items-center justify-between mb-2 mt-4 px-2 cursor-pointer hover:bg-[#f8f8f8] py-2 rounded-[5px]"
            >
              <p className="text-[13px] text4 tracking-wide Dosis-Bold">
                Chats
              </p>
              <ChevronDown
                size={18}
                className={`text5 transition-transform duration-200 ${chatsOpen ? "rotate-180" : ""
                  }`}
              />
            </div>
            <div
              tabIndex={-1}
              className={`flex flex-col gap-1.5 mt-2 overflow-y-auto scroll2 pe-3 mb-5 ${chatsOpen ? "max-h-[150px]" : "max-h-0"
                }`}
            >
              {chats.map((chat) => {
                return (
                  <div
                    key={chat.chatId}
                    className={`navlis rounded-[8px] cursor-pointer w-full py-[5px] px-2 hover:bg-[#e9e9e9]`}
                    onClick={() => {
                      setChatID(chat.chatId);
                      setSidebarOpen(false);
                      navigate(`/recipes/`);
                    }}
                  >
                    <p className="ml-[10px] text-[14px] text5">{chat.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <header
      className={`fixed top-0 w-full ${headerBgColor} border-b ${headerBorderColor} h-[60px] px-4 md:px-10 flex items-center justify-between pt-[5px] pb-[5px] z-50`}
    >
      {/* ========== LADO IZQUIERDO ========== */}
      <div className="flex items-center flex-[1]">
        {/* Botón hamburguesa (solo para usuarios regulares) */}
        {!user?.isBusiness && (
          <button
            type="button"
            title="Menu"
            tabIndex={-1}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-8 p-[6px] cursor-pointer rounded-[5px] transition-colors duration-200 border border-[#dbdbdb] hover:border-[#e5a657] hover:bg-gray-100"
          >
            <Menu className="w-[18px] h-[18px] text5 group-hover:text-white" />
          </button>
        )}

        {/* Logo y título */}
        <Link
          to={user?.isBusiness ? ROUTES.LOCAL.DASHBOARD : ROUTES.USER.DASHBOARD}
          className="flex items-center cursor-pointer hover:scale-103 transition-transform duration-200"
          tabIndex={-1}
        >
          <img
            className="w-[28px] h-[28px]"
            src={user?.isBusiness ? LogoWhite : LogoYellow}
            alt="Logo"
          />
          <span
            className={`ml-4 text-[16px] Dosis-Bold ${textColor}
            `}
          >
            {getNavLabel(location.pathname)}
          </span>
        </Link>
      </div>

      {/* ========== LADO DERECHO ========== */}
      <div className="flex items-center justify-end space-x-1 md:space-x-3 text-[14px] flex-[1]">
        {/* Buscador (solo para usuarios regulares) */}
        {!user?.isBusiness && (
          <button
            type="button"
            className="py-[5px] px-2 rounded-[5px] flex items-center gap-2 justify-start transition-all duration-300 cursor-pointer border border-[#dbdbdb] bg-white hover:bg-[#f5f5f5] hover:border-[#e5a657] lg:flex-[0.7]"
            aria-label="Buscar"
          >
            <Search className="text5" size={18} />
            <span className="hidden lg:inline text4">
              Buscar posts, recetas
            </span>
          </button>
        )}

        {/* Botón crear post (solo para usuarios regulares) */}
        {!user?.isBusiness && (
          <Link
            to={ROUTES.USER.CREATE_POST}
            className="flex items-center rounded-[5px] justify-center px-2 py-1 gap-[3px] transition-all duration-300 cursor-pointer hover:bg-gray-100 hover:border-[#e5a657] border border-[#dbdbdb]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#707070"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-plus-icon lucide-plus"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            <span className="text-[15px] text4 tracking-tighter">Crear</span>
          </Link>
        )}

        {/* Notificaciones */}
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Icono de notificaciones */}
          <button
            type="button"
            onClick={() => toggleNotifications()}
            className={`relative py-[6px] px-2 border cursor-pointer group hover:bg-gray-800 rounded-[5px] transition-colors duration-200 ${user?.isBusiness
              ? "border-[#333333] text-[#fff] hover:border-white"
              : "border-[#dbdbdb] text-[#878787] hover:text-[#fff]"
              }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-inbox-icon lucide-inbox"
            >
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
              <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
            </svg>

            {/* Badge de notificaciones no leídas */}
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-[14px] h-[14px] bg-red rounded-full flex items-center justify-center">
                <span className="text-[9px] text-white font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              </div>
            )}
          </button>

          {/* Dropdown de notificaciones */}
          {openNotifications && (
            <div
              className={`absolute right-0 top-12 w-80  rounded-lg shadow-xl border border-dashed border-gray-200 overflow-hidden z-50
            ${user?.isBusiness ? "bg-[#101828] border-[#b4b4b4]" : "bg-white"}`}
            >
              {/* Header del dropdown */}
              <div
                className={`p-4 border-b 
              ${user?.isBusiness
                    ? "bg-[#101828] border-[#dbdbdb]"
                    : "bg-gray-50 border-gray-200"
                  }`}
              >
                <h3
                  className={`text-sm Dosis-Bold ${user?.isBusiness ? "text-white" : "text-gray-900"
                    }`}
                >
                  Notificaciones
                </h3>
              </div>

              {/* Lista de notificaciones */}
              <div className="max-h-96 overflow-y-auto pb-5">
                {notifications.length === 0 ? (
                  <div
                    className={`p-4 text-center text-sm 
                  ${user?.isBusiness ? "text-white" : "text-gray-500"}`}
                  >
                    No hay notificaciones nuevas
                  </div>
                ) : (
                  notifications.map((notif, index) => (
                    <button
                      type="button"
                      key={index}
                      className={`p-4 flex items-center justify-between gap-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNotificationClick(notif);
                      }}
                    >
                      {notif.metadata?.imageURLs && (
                        <img
                          src={
                            notif.metadata.imageURLs.community !== undefined
                              ? notif.metadata.imageURLs.community
                              : notif.metadata.imageURLs.user !== undefined
                                ? notif.metadata.imageURLs.user
                                : "https://placehold.co/40x40/000000/FFFFFF.png"
                          }
                          alt="Imagen de la notificación"
                          className="max-w-[35px] w-full max-h-[35px] h-full object-cover rounded-full"
                        />
                      )}
                      <div>
                        <p className={`text-[14px] Dosis-Bold ${user?.isBusiness ? "text-white" : "text5"}`}>
                          {notif.metadata?.title || "Notificación DualEat"}
                        </p>
                        <p className={`text-[13px] ${user?.isBusiness ? "text-gray-300" : "text4"}`}>{notif.message}</p>
                      </div>
                      <span className="text-[13px] text-gray-500">
                        {formatShortTime(new Date(notif.created_at))}
                      </span>
                    </button>
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

        {/* Botón de perfil */}
        <div className="p-1 cursor-pointer hover:bg-[#dbdbdb] rounded-3xl transition duration-100">
          {user && (
            <img
              className="w-[30px] h-[30px] rounded-full"
              src={user?.avatar_url || ""}
              alt=""
            />
          )}
        </div>
      </div>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className={`fixed inset-0 z-20 ${user?.isBusiness ? "bg-[#101828]/30" : "bg-[#F6F8FA]/30"
            }`}
        />
      )}

      {sidebarOpen && (
        <div
          className={` rounded-tr-[15px] rounded-br-[15px] fixed top-0 left-0 h-full w-[280px] md:w-[320px] z-50
            ${user?.isBusiness
              ? "bg-[#101828] border-r border-[#707070] shadow-[0px_0px_10px_0px_rgba(135,135,135,0.2)]"
              : "bg-[#ffffff] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.3)]"
            }
            `}
        >
          <div>
            <div className="flex items-center justify-between px-5 py-4">
              <img
                className="w-[28px] h-[28px]"
                src={user?.isBusiness ? LogoWhite : LogoYellow}
                alt="Logo DualEat"
              />
              <button
                title="Cerrar menú"
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-2 cursor-pointer rounded-lg transition-colors duration-200 hover:bg-gray-200"
              >
                <X
                  className={`w-[15px] h-[15px] ${user?.isBusiness
                    ? "text-gray-400 group-hover:text-white"
                    : "text-black group-hover:text-white"
                    }`}
                />
              </button>
            </div>
            <div className="mt-4 flex flex-col justify-between h-[90vh] ms-4 me-5 text-[13px] pb-3 relative">
              {sidebarContent}

              {/* Botón de cerrar sesión */}
              <div>
                <div className="border-t border-dashed border-gray-300 mb-2"></div>
                <button
                  type="button"
                  onClick={() => handleLogout()}
                  className={`navlis w-full rounded-[8px] group cursor-pointer p-2 transition-all duration-200
                  ${user?.isBusiness
                      ? "text-gray-400 hover:bg-red-900/40 hover:text-red-400"
                      : "hover:bg-[#b53325] "
                    }`}
                >
                  <LogOut
                    className={`flex-shrink-0 text-[#b53325] group-hover:text-white transition-colors`}
                    size={16}
                    strokeWidth={2.5}
                    color="currentColor"
                  />
                  <span
                    className={`ml-3 text-left text-[14px] whitespace-nowrap
                    ${user?.isBusiness
                        ? "group-hover:text-red-400! text1"
                        : "group-hover:text-white! text4"
                      }`}
                  >
                    Cerrar sesión
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {createCommunityModalOpen && user && (
        <CommunityModal
          onClose={() => setCreateCommunityModalOpen(false)}
          user={user}
        />
      )}
    </header>
  );
};

export default HeaderUSER;
