import { ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";


interface SidebarItemProps {
  icon: React.JSX.Element; // Icono SVG ( SVG / component)
  label: string; // Texto

  path?: string; // Ruta
  onPress?: () => void; // Función onPress
  isExpanded?: boolean | null; // Para saber si está expandido
  extra?: React.JSX.Element | null; // Elementos extra
}

export const SidebarItem = ({
  icon,
  label,
  path,
  onPress,
  isExpanded,
  extra,
}: SidebarItemProps) => {
  const location = useLocation();

  const isActive = location.pathname === path;

  return (
    <div className="flex flex-row justify-between items-center w-full">
      <button
        type="button"
        title={label}
        onClick={onPress}
        className={`flex items-center py-1.5 cursor-pointer w-full transition-all duration-200 ease-in-out ${
          onPress && "justify-between"
        }`}
      >
        <div className="flex w-full items-center gap-x-2">
          <div
            style={{ borderRadius: 999 }}
            className={`w-1 h-6 ${isActive && "bg-yellow"}`}
          />
          <div
            style={{ flex: 1 }}
            className="gap-x-2.5 rounded-[3px] shrink-0 px-2 flex items-center transition-transform duration-200 ease-in-out hover:scale-105 origin-left"
          >
            {icon}
            <span className="text-sm shrink-0 text-text-4">{label}</span>
          </div>
        </div>
        {isExpanded !== null && (
          <ChevronDown
            size={18}
            color="#707070"
            className={`transition-transform duration-300 ${
              isExpanded ? "rotate-0" : "rotate-180"
            }`}
          />
        )}
      </button>
      {extra}
    </div>
  );
};
