import { Link, useLocation } from "react-router-dom";
import {
  Settings,
  LogOut,
  Home,
  Users,
  ClipboardList,
  MessageSquare,
  QrCode,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface BusinessSidebarProps {
  children: React.ReactNode;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const BusinessSidebar: React.FC<BusinessSidebarProps> = ({
  children,
  isCollapsed = false,
}) => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      path: "/business/dashboard",
    },
    {
      id: "personal",
      label: "Personal",
      icon: Users,
      path: "/business/personal",
    },
    {
      id: "menu",
      label: "Menú",
      icon: ClipboardList,
      path: "/business/menu",
    },
    {
      id: "qr",
      label: "QR",
      icon: QrCode,
      path: "/business/qr",
    },
    {
      id: "reviews",
      label: "Reseñas",
      icon: MessageSquare,
      path: "/business/reviews",
    },
    {
      id: "settings",
      label: "Configuración",
      icon: Settings,
      path: "/business/settings",
    },
  ];

  const handleLogout = () => {
    logout();
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bgFood2">
      <div
        className={`fixed left-0 top-[60px] h-[calc(100vh-60px)] bg-gray-900 border-r border-gray-700 z-40 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-16" : "w-64"
        } shadow-lg`}
      >
        <div className="flex flex-col h-full">
          {/* User Info */}
          {!isCollapsed && (
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#B53325] to-[#d94a36] rounded-full flex items-center justify-center">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || "Usuario"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.subscription_status}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="flex-1 py-4">
            <nav className="space-y-1 px-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.path);

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    title={isCollapsed ? item.label : ""}
                    className={`group flex items-center rounded-xl text-sm font-medium transition-all duration-200
                    ${isCollapsed ? "justify-center px-0 py-3" : "px-3 py-3"}
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
                    {!isCollapsed && (
                      <span className="ml-3 truncate">{item.label}</span>
                    )}
                    {isActive && !isCollapsed && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Logout Button */}
          <div className="p-3 border-t border-gray-700">
            <button
              type="button"
              onClick={handleLogout}
              title={isCollapsed ? "Cerrar sesión" : ""}
              className="group flex items-center cursor-pointer w-full px-3 py-3 text-sm font-medium text-gray-400 hover:bg-red-900/40 hover:text-red-400 rounded-xl transition-all duration-200"
            >
              <LogOut size={20} className="flex-shrink-0 text-red-500" />
              {!isCollapsed && (
                <span className="ml-3 truncate">Cerrar sesión</span>
              )}
            </button>
          </div>
        </div>
      </div>
      <div className={`${isCollapsed ? "pl-16" : "pl-64"}`}>{children}</div>
    </div>
  );
};

export default BusinessSidebar;