import { ROUTES } from "@/api/constants/constants";
import Loader from "@/components/ui/feedback/Loader";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notification } from "@/interface/global";
import { getShortTimeAgo } from "@/utils/date";
import { BellCheck, BellMinus } from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NotificationView() {
  const {
    notifications,
    markAsRead,
    markAsReadSingle,
    deleteNotification,
    isLoading,
  } = useNotifications();
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

  const EmptyHeader = () => {
    if (isLoading) return null;

    return (
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
    );
  };

  return (
    <section className="w-full h-full px-8 py-6 flex flex-col gap-y-3 bg-bg-semi-white">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-2xl text-text-3 font-bold">Notificaciones</h1>
        <div className="flex justify-start items-center gap-1">
          <button
            type="button"
            onClick={() => {
              markAsRead();
            }}
            title="Marcar notificaciones como leidas"
            className="cursor-pointer transition-all duration-200 flex flex-row items-center gap-x-2 hover:bg-gray-200  rounded-full px-4 py-1"
          >
            <BellCheck size={18} color="#2F2F2F" />
            <span className="text-text-3 font-bold text-sm">
              Marcar como leido
            </span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-1 justify-center">
          <Loader size={20} color="#e5a657" />
        </div>
      ) : notifications && notifications.length > 0 ? (
        <>
          {notifications.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => handleNavegation(item)}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`relative w-full flex flex-row border-y border-dashed border-gray-200 gap-x-3 px-4 py-3 justify-between items-start cursor-pointer transition-colors duration-150 ${item.read ? "bg-bg-semi-white hover:bg-gray-50" : "bg-bg-gray hover:bg-zinc-200/50"
                }`}
            >
              {/* Información de la notificación (Título, mensaje y fecha) */}
              <div className="flex flex-col flex-1 gap-y-1">
                <p className="font-Outfit font-bold text-[14px] text-text-3 truncate max-w-full">
                  {item.title}
                </p>
                <p className="font-Outfit font-light text-[14px] text-text-5 line-clamp-3">
                  &quot;{item.message}&quot;
                </p>
                <span className="font-Outfit font-light text-[12px] text-text-5 mt-1 block">
                  {getShortTimeAgo(new Date(item.created_at))}
                </span>
              </div>

              {/* Imagen opcional proveniente de metadata */}
              {item.metadata?.image_urls &&
                item.metadata.image_urls.length > 0 && (
                  <img
                    src={item.metadata.image_urls[0]}
                    className="w-[50px] h-[50px] rounded-md object-cover shrink-0 border border-gray-100"
                    alt="Previsualización"
                  />
                )}

              {/* Botón flotante para eliminar (equivalente web al Swipeable) */}
              {hoveredIndex === idx && (
                <div className="absolute rounded-full p-0.5 -top-3.5 border border-gray-200 shadow-md right-2 w-fit h-fit bg-white z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(item.id);
                    }}
                    className="p-1.5 hover:bg-gray-100 rounded-full cursor-pointer flex items-center justify-center"
                    type="button"
                    title="Eliminar notificación"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#4A4947"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-trash"
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
        EmptyHeader()
      )}
    </section>
  );
}
