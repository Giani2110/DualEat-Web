import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { OUT_NAVBAR_ROUTES } from "../../constants/navbar-routes";
import { ROUTES } from "../../constants/constants";
import { useAuth } from "../../hooks/useAuth";
import { useCommunity } from "../../hooks/useUCommunity";
import { useNotifications } from "../../hooks/useNotifications";
import {
  Search,
  Plus,
  Menu,
  X,
  ChevronUp,
  LogOut,
  Home,
  Users,
  ClipboardList,
  MessageSquare,
  QrCode,
  Settings,
} from "lucide-react";
import LogoYellow from "../../assets/images/icon/Logo DualEatYellow.png";
import LogoWhite from "../../assets/images/icon/Logo_DualEat.png";
import CommunityModal from "../../components/modal/CommunityModal";
import type { Community, Notification } from "../../interface/global";
import { useNavigate } from "react-router-dom";
import { formatShortTime } from "../../utils/compactNumber";

const HeaderUSER = () => {
  // ==================== HOOKS ====================
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { userCommunities } = useCommunity();
  const { notifications, unreadCount, markAsRead, markAsReadSingle } =
    useNotifications();

  // ==================== ESTADOS ====================
  const [communityOpen, setCommunityOpen] = useState(true);
  const [recents, setRecents] = useState<[]>([]);
  const [recentsOpen, setRecentsOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createCommunityModalOpen, setCreateCommunityModalOpen] =
    useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);

  // ==================== REFS ====================
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== CONSTANTES ====================
  // Items del menú para usuarios business
  const menuItems = [
    {
      label: "Dashboard",
      icon: Home,
      path: ROUTES.LOCAL.DASHBOARD,
    },
    {
      label: "Calendario",
      icon: Users,
      path: ROUTES.LOCAL.CALENDAR,
    },
    {
      label: "Menú",
      icon: ClipboardList,
      path: ROUTES.LOCAL.MENU,
    },
    {
      label: "QR",
      icon: QrCode,
      path: ROUTES.LOCAL.QR,
    },
    {
      id: "reviews",
      label: "Reseñas",
      icon: MessageSquare,
      path: ROUTES.LOCAL.REVIEWS,
    },
    {
      label: "Configuración",
      icon: Settings,
      path: ROUTES.LOCAL.SETTINGS,
    },
  ];

  // Colores dinámicos según tipo de usuario
  const headerBgColor = user.isBusiness ? "bg-gray-900" : "bg-[#fdfdfd]";
  const headerBorderColor = user.isBusiness
    ? "border-gray-700"
    : "border-[#e5a657]";
  const textColor = user.isBusiness ? "text-white" : "text-yellow";

  // ==================== EFECTOS ====================
  // Detectar scroll
 


  // Cargar comunidades recientes del localStorage
  useEffect(() => {
    const communities = localStorage.getItem("community");
    if (communities) {
      setRecents(JSON.parse(communities));
    }
  }, [location.pathname]);

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
          notification.metadata.slugs.post
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

  // Click en comunidad (guarda en recientes)
  const handleCommunityClick = (Community: Community) => {
    const stored = localStorage.getItem("community");
    const communities = stored ? JSON.parse(stored) : [];

    // Evitar duplicados
    const exists = communities.some((c: Community) => c.id === Community.id);

    if (!exists) {
      if (communities.length > 5) {
        communities.shift();
      }
      communities.push(Community);
      localStorage.setItem("community", JSON.stringify(communities));
    }
    navigate(`/c/${Community.slug}/`);
  };

  // Cerrar sesión
  const handleLogout = () => {
    logout();
  };

  // ==================== UTILIDADES ====================
  // Verificar si una ruta está activa
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  // Obtener label de navegación según pathname
  const getNavLabel = (pathname: string): string => {
    if (pathname.startsWith(ROUTES.USER.DASHBOARD)) return "Inicio";
    if (pathname.startsWith(ROUTES.USER.EXPLORE)) return "Explorar";
    if (pathname.startsWith(ROUTES.USER.RECIPES)) return "Recetas";
    if (pathname.startsWith(ROUTES.USER.COMMUNITY)) return "Comunidad";
    if (pathname.startsWith(ROUTES.USER.NOTIFICATIONS)) return "Notificaciones";

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
  // Sidebar para usuarios business
  const sidebarContent = user.isBusiness ? (
    <>
      {/* Información del usuario */}
      <div className="flex items-center space-x-3 p-4 border-b border-[#dbdbdb]">
        <div className=" flex items-center justify-center">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-semibold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] text-white truncate Dosis-Bold">
            {user?.name || "Usuario"}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {user?.subscription_status}
          </p>
        </div>
      </div>

      {/* Items del menú */}
      <div className="flex-1 py-4">
        <nav className="space-y-2 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);

            return (
              <Link
                key={item.id}
                to={item.path}
                title={item.label}
                className={`group flex items-center text-sm transition-all duration-200 rounded-[5px] px-[8px] py-[7px]
                    
                    ${
                      isActive
                        ? "bg-[#B53325] text-white shadow-md"
                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`}
              >
                <Icon
                  size={20}
                  className={`flex-shrink-0 transition-colors ${
                    isActive
                      ? "text-white"
                      : "text-gray-500 group-hover:text-white"
                  }`}
                />

                <span className="ml-3 truncate">{item.label}</span>

                {isActive && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Botón de cerrar sesión */}
      <div className="p-2 border-t border-gray-700 border-dashed">
        <button
          type="button"
          onClick={handleLogout}
          title="Cerrar sesión"
          className="group flex items-center cursor-pointer w-full px-3 py-2 text-sm font-medium text-gray-400 hover:bg-red-900/40 hover:text-red-400 rounded-[5px] transition-all duration-200"
        >
          <LogOut size={20} className="flex-shrink-0 text-red-500" />
          <span className="ml-3 truncate">Cerrar sesión</span>
        </button>
      </div>
    </>
  ) : (
    // Sidebar para usuarios regulares
    <>
      <div className="flex flex-col gap-1">
        {/* Inicio */}
        <Link title="Inicio" to={ROUTES.USER.DASHBOARD} className={`navlis`}>
          {location.pathname === ROUTES.USER.DASHBOARD && (
            <div className="w-1 h-[80%] rounded-[10px] bg-[#e5a657]"></div>
          )}

          <div
            className={`navlis ms-2 w-full rounded-[5px] text5 cursor-pointer px-[8px] py-[5px]  ${
              location.pathname === ROUTES.USER.DASHBOARD
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
        </Link>

        {/* Explorar */}
        <Link
          title="Explorar comunidades"
          to={ROUTES.USER.EXPLORE}
          className={`navlis`}
        >
          {location.pathname === ROUTES.USER.EXPLORE && (
            <div className="w-1 h-[80%] rounded-[10px] bg-[#e5a657]"></div>
          )}

          <div
            className={`navlis ms-2 w-full rounded-[5px] text5 cursor-pointer px-[8px] py-[5px]  ${
              location.pathname === ROUTES.USER.EXPLORE
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
        </Link>

        {/* Recetas */}
        <Link
          title="Explorar recetas"
          to={ROUTES.USER.RECIPES}
          className={`navlis`}
        >
          {location.pathname === ROUTES.USER.RECIPES && (
            <div className="w-1 h-[80%] rounded-[10px] bg-[#e5a657]"></div>
          )}

          <div
            className={`navlis ms-2 w-full rounded-[5px] text5 cursor-pointer px-[8px] py-[5px]  ${
              location.pathname === ROUTES.USER.RECIPES
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
        </Link>

        <div className="w-full h-[1px] border-t border-[#dbdbdb] mt-3" />

        {/* Recientes */}
        <div className="px-2">
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
              className={`transition-transform duration-300 ${
                recentsOpen ? "rotate-0" : "rotate-180"
              } `}
            />
          </div>
          {recentsOpen && (
            <>
              {recents.length > 0 &&
                recents.map((community: Community) => (
                  <button
                    type="button"
                    key={community.id}
                    title={community.name}
                    onClick={() => handleCommunityClick(community)}
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

        <div className="w-full h-[1px] border-t border-[#dbdbdb] mt-1" />

        {/* Comunidades */}
        <div className="px-2">
          <div
            onClick={() => setCommunityOpen(!communityOpen)}
            className="w-full flex items-center justify-between mb-2 mt-3 px-2 cursor-pointer hover:bg-[#f8f8f8] py-2 rounded-[5px]"
          >
            <h3 className="text-[13px] text4 tracking-wide Dosis-Bold ">
              Comunidades
            </h3>
            <ChevronUp
              size={18}
              color="#333333"
              className={`transition-transform duration-300 ${
                communityOpen ? "rotate-0" : "rotate-180"
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
              {userCommunities.map((community) => (
                <button
                  type="button"
                  key={community.community.id}
                  title={community.community.name}
                  onClick={() => handleCommunityClick(community.community)}
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
              ))}
            </>
          )}
        </div>

        <div className="w-full h-[1px] border-t border-[#dbdbdb] mt-1" />

        {/* Chats */}
        <div className="px-2">
          <div className="w-full flex items-center justify-between px-2 mb-2 mt-3 cursor-pointer hover:bg-[#f8f8f8] py-2 rounded-[5px]">
            <h3 className="text-[13px] text4 tracking-wide Dosis-Bold ">
              Chats
            </h3>
            <ChevronUp
              size={18}
              color="#333333"
              className={`transition-transform duration-300 ${
                recentsOpen ? "rotate-0" : "rotate-180"
              } `}
            />
          </div>
        </div>
      </div>

      {/* Botón de cerrar sesión */}
      <div>
        <div className="border-t border-dashed border-gray-300 mb-1"></div>
        <button
          type="button"
          onClick={() => handleLogout()}
          className={`navlis w-full rounded-[8px] group cursor-pointer p-2 hover:bg-[#e9e9e9]`}
        >
          <LogOut
            color="#b53325"
            className="flex-shrink-0"
            size={16}
            strokeWidth={2.5}
          />
          <span
            className={`ml-3 text-left text-[14px] text4 whitespace-nowrap`}
          >
            Cerrar sesión
          </span>
        </button>
      </div>
    </>
  );

  // ==================== RENDER PRINCIPAL ====================
  return (
    <header
      className={`fixed top-0 w-full ${headerBgColor} border-b ${headerBorderColor} h-[60px] px-4 md:px-10 flex items-center justify-between pt-[5px] pb-[5px] z-50`}
    >
      {/* ========== LADO IZQUIERDO: Logo y botón hamburguesa ========== */}
      <div className="flex items-center flex-[1]">
        {/* Botón hamburguesa */}
        <button
          type="button"
          title="Menu"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`mr-8 p-[6px] cursor-pointer rounded-[5px] transition-colors duration-200 border border-[#dbdbdb] ${
            user.isBusiness ? "hover:bg-gray-800" : "hover:bg-gray-100"
          }`}
        >
          <Menu
            className={`w-[18px] h-[18px] ${
              user.isBusiness
                ? "text-gray-400 group-hover:text-white"
                : "text5 group-hover:text-white"
            }`}
          />
        </button>

        {/* Logo y título */}
        <Link
          to={user.isBusiness ? ROUTES.LOCAL.DASHBOARD : ROUTES.USER.DASHBOARD}
          className="flex items-center cursor-pointer hover:scale-103 transition-transform duration-200"
          tabIndex={-1}
        >
          <img
            className="w-[28px] h-[28px]"
            src={user.isBusiness ? LogoWhite : LogoYellow}
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

      {/* ========== LADO DERECHO: Iconos de acción ========== */}
      <div className="flex items-center justify-end space-x-1 md:space-x-3 text-[14px] flex-[1]">
        {/* Buscador (solo para usuarios regulares) */}
        {!user.isBusiness && (
          <button
            type="button"
            className="py-[5px] px-2 rounded-[5px] flex items-center gap-2 justify-start cursor-pointer border border-[#dbdbdb] bg-white hover:bg-[#f5f5f5] lg:flex-[0.7]"
            aria-label="Buscar"
          >
            <Search className="text5" size={18} />
            <span className="hidden lg:inline text4">
              Buscar posts, recetas
            </span>
          </button>
        )}

        {/* Botón crear post (solo para usuarios regulares) */}
        {!user.isBusiness && (
          <Link
            to={ROUTES.USER.CREATE_POST}
            className="flex items-center rounded-[5px] justify-center px-2 py-1 gap-[3px] cursor-pointer hover:bg-gray-100 border border-[#dbdbdb]"
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
            className={`relative py-[6px] px-2 border cursor-pointer group hover:bg-gray-800 rounded-[5px] transition-colors duration-200 ${
              user.isBusiness ? "border-[#b4b4b4]" : "border-[#dbdbdb]"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={user.isBusiness ? "#FFFFFF" : "#878787"}
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
              className={`absolute right-0 top-full w-80  rounded-lg shadow-xl border border-dashed border-gray-200 overflow-hidden z-50
            ${user.isBusiness ? "bg-[#101828] border-[#b4b4b4]" : "bg-white"}`}
            >
              {/* Header del dropdown */}
              <div
                className={`p-4 border-b 
              ${
                user.isBusiness
                  ? "bg-[#101828] border-[#dbdbdb]"
                  : "bg-gray-50 border-gray-200"
              }`}
              >
                <h3
                  className={`text-sm Dosis-Bold ${
                    user.isBusiness ? "text-white" : "text-gray-900"
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
                  ${user.isBusiness ? "text-white" : "text-gray-500"}`}
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
                        <p className="text-[14px] text5 Dosis-Bold">
                          {notif.metadata?.title}
                        </p>
                        <p className="text-[13px] text4">{notif.message}</p>
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

      {sidebarOpen && (
        <div
          className={`fixed inset-0 z-20 ${
            user.isBusiness ? "bg-[#101828]/30" : "bg-[#F6F8FA]/30"
          }`}
        />
      )}

      {sidebarOpen && (
        <div
          className={` rounded-tr-[15px] rounded-br-[15px] fixed top-0 left-0 h-full w-[280px] md:w-[320px] z-50
            ${
              user.isBusiness
                ? "bg-[#101828] border-r border-[#707070] shadow-[0px_0px_10px_0px_rgba(135,135,135,0.2)]"
                : "bg-[#ffffff] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.3)]"
            }
            `}
        >
          <div>
            <div className="flex items-center justify-between px-5 py-4">
              <img
                className="w-[28px] h-[28px]"
                src={user.isBusiness ? LogoWhite : LogoYellow}
                alt="Logo DualEat"
              />
              <button
                title="Cerrar menú"
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-2 cursor-pointer rounded-lg transition-colors duration-200 hover:bg-gray-200"
              >
                <X
                  className={`w-[15px] h-[15px] ${
                    user.isBusiness
                      ? "text-gray-400 group-hover:text-white"
                      : "text-black group-hover:text-white"
                  }`}
                />
              </button>
            </div>
            <div className="mt-4 flex flex-col justify-between h-[90vh] ms-4 me-5 text-[13px] pb-3 relative">
              {sidebarContent}
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
