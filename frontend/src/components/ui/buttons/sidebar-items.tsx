import { ROUTES } from "@/api/constants/constants";
import CommunityModal from "@/components/features/create/community/CommunityModal";
import { useMyCommunities } from "@/hooks/api/community/useCommunity";
import type { User } from "@/interface/global";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useLocation, type NavigateFunction } from "react-router-dom";

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
    <div className="flex flex-row justify-between items-center">
      <button
        type="button"
        title={label}
        onClick={onPress}
        className={`flex items-center hover:bg-gray-100 py-1.5 cursor-pointer w-full ${
          onPress && "justify-between"
        }`}
      >
        <div className="flex w-full items-center gap-x-2">
          <div
            style={{ borderRadius: 999 }}
            className={`w-1 h-6 ${isActive && "bg-yellow"}`}
          />

          {/* Contenedor del ícono y texto */}
          <div
            style={{ flex: 1 }}
            className={`gap-x-2.5 rounded-[3px] shrink-0 px-2 flex items-center`}
          >
            {icon}
            <span
              className={`text-[15px] shrink-0 ${isActive ? "font-bold text-text-3" : "text-text-4"}`}
            >
              {label}
            </span>
          </div>
        </div>
        {isExpanded !== null && (
          <ChevronDown
            size={20}
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

export const UserSidebarItems = ({
  navigate,
  size,
  user,
}: {
  navigate: NavigateFunction;
  size?: number;
  user: User;
}) => {
  const [expanded, setExpanded] = useState({
    comunity: false,
    chat: false,
    create: false,
  });

  const { data: communities } = useMyCommunities();

  return (
    <>
      <SidebarItem
        icon={
          <svg
            width={size}
            height={size}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
          >
            <path
              fill={"#707070"}
              d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z"
            />
          </svg>
        }
        label="Explorar"
        isExpanded={null}
        onPress={() => navigate(ROUTES.USER.EXPLORE("", ""))}
      />

      <SidebarItem
        icon={
          <svg width={size} height={size} viewBox="0 0 640 640">
            <path
              fill={"#707070"}
              d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z"
            />
          </svg>
        }
        label="Crear comunidad"
        isExpanded={null}
        onPress={() => setExpanded({ ...expanded, create: !expanded.create })}
      />

      <SidebarItem
        icon={
          <img
            src="https://img.icons8.com/fluency-systems-regular/48/conference-call--v1.png"
            alt="Community icon"
            color="#707070"
            style={{ width: size, height: size }}
          />
        }
        label="Comunidades"
        isExpanded={expanded.comunity}
        onPress={() =>
          setExpanded({ ...expanded, comunity: !expanded.comunity })
        }
      />

      {expanded.comunity &&
        communities?.map((item) => (
          <SidebarItem
            key={item.id}
            icon={
              <img
                src={item.community.image_url}
                alt="Imágen de comunidad"
                style={{ width: 25, height: 25 }}
                className="object-cover rounded-full"
              />
            }
            label={item.community.name}
            isExpanded={null}
            onPress={() =>
              navigate(ROUTES.USER.COMMUNITY(item.community?.slug || ""))
            }
          />
        ))}

      <SidebarItem
        icon={
          <svg width={size} height={size} viewBox="0 0 640 640">
            <path
              fill={"#707070"}
              d="M115.9 448.9C83.3 408.6 64 358.4 64 304C64 171.5 178.6 64 320 64C461.4 64 576 171.5 576 304C576 436.5 461.4 544 320 544C283.5 544 248.8 536.8 217.4 524L101 573.9C97.3 575.5 93.5 576 89.5 576C75.4 576 64 564.6 64 550.5C64 546.2 65.1 542 67.1 538.3L115.9 448.9zM153.2 418.7C165.4 433.8 167.3 454.8 158 471.9L140 505L198.5 479.9C210.3 474.8 223.7 474.7 235.6 479.6C261.3 490.1 289.8 496 319.9 496C437.7 496 527.9 407.2 527.9 304C527.9 200.8 437.8 112 320 112C202.2 112 112 200.8 112 304C112 346.8 127.1 386.4 153.2 418.7z"
            />
          </svg>
        }
        label="Chats"
        isExpanded={expanded.chat}
        onPress={() => setExpanded({ ...expanded, chat: !expanded.chat })}
      />

      {expanded.create && (
        <CommunityModal
          user={user}
          onClose={() => setExpanded({ ...expanded, create: !expanded.create })}
        />
      )}
    </>
  );
};
