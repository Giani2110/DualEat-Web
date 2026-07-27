import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { ROUTES } from "@/api/constants/constants";
import {
  LayoutDashboard,
  Store,
  Coffee,
  PlusCircle,
  LogOut,
  Menu,
  X,
  Users,
  HeadphonesIcon,
} from "lucide-react";
import { useAuth } from "@hooks/useAuth";

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  const navigation = [
    { name: "Dashboard", href: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard },
    { name: "Locales", href: ROUTES.ADMIN.LOCALS, icon: Store },
    { name: "Usuarios", href: ROUTES.ADMIN.USERS, icon: Users },
    {
      name: "Categorías de Comida",
      href: ROUTES.ADMIN.FOOD_CATEGORIES,
      icon: Coffee,
    },
    {
      name: "Alta Manual",
      href: ROUTES.ADMIN.BUSINESS_CREATION,
      icon: PlusCircle,
    },
    {
      name: "Soporte",
      href: ROUTES.ADMIN.SUPPORT_TICKETS,
      icon: HeadphonesIcon,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-gray-950">
          <span className="text-xl font-bold font-bold text-yellow-500">
            DualEat Admin
          </span>
          <button
            className="lg:hidden text-gray-300 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex flex-col gap-2 p-4 mt-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-yellow-500 text-gray-900 font-bold" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 lg:hidden shadow-sm">
          <span className="text-xl font-bold text-gray-800">Panel Admin</span>
          <button
            className="text-gray-500 focus:outline-none"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">{children || <Outlet />}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
