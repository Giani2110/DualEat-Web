import { ROUTES } from "@/api/constants/constants";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notification } from "@/interface/global";
import { getShortTimeAgo } from "@/utils/date";
import { BellMinus } from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NotificationView() {
  const { notifications, markAsRead, markAsReadSingle, deleteNotification } =
    useNotifications();
  const navigate = useNavigate();

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleNavegation = useCallback(
    (item: Notification) => {
      switch (item.content_type) {
        case "POST":
          navigate(
            `${ROUTES.USER.POST(item.content_id as string, item.metadata.params?.slug)}`,
          );
          break;

        default:
          break;
      }

      markAsReadSingle(item.id);
    },
    [navigate, markAsReadSingle],
  );

  return (
    <section className="w-full h-full px-8 my-5 flex flex-col gap-y-4 lg:max-w-[60vw] bg-bg-semi-white">
      <h1 className="text-[28px] tracking-tight text3 font-bold">
        Notificaciones
      </h1>
      {notifications && notifications.length > 0 ? (
        <>
          <div className="flex justify-end items-center gap-1 mt-2">
            <button
              type="button"
              onClick={() => {
                markAsRead();
              }}
              title="Marcar notificaciones como leidas"
              className="cursor-pointer text3 font-bold text-[16px] text5 p-2"
            >
              Marcar como leido
            </button>
          </div>

          {notifications.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => handleNavegation(item)}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`relative flex flex-wrap gap-3 items-start cursor-pointer px-4 py-3 ${
                item.read === false
                  ? "bg-[#dddddd] hover:bg-[#cccccc]"
                  : "hover:bg-[#e9e9e9]"
              }`}
            >
              <div className="flex flex-col text-text-4 flex-1 text-base">
                <p className="font-bold text-text-5">{item.title}</p>
                <p>{item.message}</p>
                <span className="text-sm">
                  {getShortTimeAgo(new Date(item.created_at))}
                </span>
              </div>

              {hoveredIndex === idx && (
                <div className="absolute rounded-full p-0.5 -top-5 border-1 border-[#a7a7a7] shadow-md right-0 w-fit h-fit bg-[#ffffff] z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(item.id);
                    }}
                    className="p-2 hover:bg-[#dddddd] rounded-full cursor-pointer"
                    type="button"
                    title="Eliminar notificación"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#4A4947"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-trash-icon lucide-trash"
                    >
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      <path d="M3 6h18" />
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </>
      ) : (
        <div className="w-full justify-center items-center flex flex-col py-4 gap-y-2 border-y border-dashed border-gray-400">
          <BellMinus size={24} color="#2F2F2F" />

          <h1 className=" font-bold text-[16px] text-text-3">
            &quot;Todo en calma por aquí&quot;
          </h1>
          <p className="font-regular text-[14px] text-text-4">
            Tus alertas, mensajes y novedades importantes aparecerán en este
            lugar.
          </p>
        </div>
      )}
    </section>
  );
}
