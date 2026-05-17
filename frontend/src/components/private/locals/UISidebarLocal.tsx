import { Link, useLocation } from "react-router-dom";
import {
  Settings,
  LogOut,
  Home,
  Users,
  ClipboardList,
  MessageSquare,
  QrCode,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@hooks/useAuth";
import { LocalSupportWidget } from "../../../components/support/LocalSupportWidget";

interface BusinessSidebarProps {
  children: React.ReactNode;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const BusinessSidebar: React.FC<BusinessSidebarProps> = ({
  children,
  isCollapsed,
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
      id: "calendar",
      label: "Calendario",
      icon: Users,
      path: "/business/calendar",
    },
    {
      id: "menu",
      label: "Menú",
      icon: ClipboardList,
      path: "/business/menu",

    },
    {
      id: "employees",
      label: "Empleados",
      icon: Users,
      path: "/business/employees",
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

  const subscriptionItem = {
    id: "subscription",
    label: "Pase PRO",
    icon: CreditCard,
    path: "/business/subscription",
  };

  const handleLogout = () => {
    logout();
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const isSubscriptionActive = isActiveRoute(subscriptionItem.path);

  return (
    <div className="min-h-screen bgFood2">
      <div
        className={`fixed left-0 top-[60px] h-[calc(100vh-60px)] bg-gray-900 border-r border-gray-700 z-40 transition-all duration-300 ease-in-out ${isCollapsed ? "w-16" : "w-64"
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
                      ${isActive
                        ? "bg-[#B53325] text-white shadow-md"
                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                      }`}
                  >
                    <Icon
                      size={20}
                      className={`flex-shrink-0 transition-colors ${isActive
                        ? "text-white"
                        : "text-gray-500 group-hover:text-white"
                        }`}
                    />
                    {!isCollapsed && (
                      <span className="ml-3 truncate">{item.label}</span>
                    )}
                    {user?.subscription_status !== "active" &&
                      (item.id === "dashboard" || item.id === "calendar") &&
                      !isCollapsed && (
                        <span className={`bg-gradient-to-r from-amber-400 to-yellow-600 text-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${isActive ? 'ml-2' : 'ml-auto'}`}>
                          PRO
                        </span>
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

          {/* Subscription Button (Golden/Gradient) */}
          <div className="p-3">
            <Link
              to={subscriptionItem.path}
              title={isCollapsed ? subscriptionItem.label : ""}
              className={`group flex items-center w-full px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 shadow-xl
                ${isCollapsed ? "justify-center px-0" : "px-3"}
                ${isSubscriptionActive
                  ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-gray-900 font-bold" // Active state
                  : "bg-gradient-to-r from-amber-400 to-yellow-600 hover:from-amber-300 hover:to-yellow-500 text-gray-900 font-bold" // Default state
                }
                relative overflow-hidden
              `}
            >
              <subscriptionItem.icon
                size={20}
                className={`flex-shrink-0 transition-colors ${isSubscriptionActive ? "text-gray-900" : "text-gray-900"
                  }`}
              />
              {!isCollapsed && (
                <span className="ml-3 truncate">{subscriptionItem.label}</span>
              )}

              {/* Overlay para efecto de destello / brillo */}
              <div
                className={`absolute inset-0 opacity-20 transition-opacity duration-300 ${isSubscriptionActive ? 'bg-white' : 'hover:bg-white'
                  }`}
                aria-hidden="true">
              </div>

            </Link>
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
      <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? "pl-16" : "pl-64"}`}>{children}</div>
      <LocalSupportWidget />
    </div>
  );
};

export default BusinessSidebar;