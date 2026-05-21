import { useLocation, useNavigate } from "react-router-dom";

interface NavItemProps {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const NavItem = ({ label, path, icon }: NavItemProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = location.pathname === path;

  return (
    <button
      type="button"
      title={label}
      onClick={() => navigate(path)}
      className="flex items-center"
      >
    
      {isActive && (
        <div className="w-1 h-[80%] rounded-[10px] bg-[var(--bg-yellow)]"></div>
      )}

      {/* Contenedor del ícono y texto */}
      <div
        className={`ms-2 w-full rounded-[5px] text3 cursor-pointer px-2 py-1 flex items-center ${
          isActive ? "bg-gray-200 Dosis-Bold" : "ms-3 hover:bg-[#fefefe]"
        }`}
      >
        {icon}
        <span className="ml-3 text-[15px]">{label}</span>
      </div>
    </button>
  );
};
