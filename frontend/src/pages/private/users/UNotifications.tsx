import { useEffect, useState } from "react";
import { useNotifications } from "@hooks/useNotifications";
import { formatShortTime } from "@utils/compactNumber";

import { axiosInterceptor } from "@interceptor/axios-interceptor";
import { useNavigate } from "react-router-dom";

import type { Notification } from "@interface/global";
import toast from "react-hot-toast";

const UNotifications = () => {
  const { markAsRead, markAsReadSingle, setNotifications } = useNotifications();
  const navigate = useNavigate();

  const [notificationsPaginated, setNotificationsPaginated] = useState<
    Notification[]
  >([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInterceptor.get("/notification/");

        if (response.data.success === true && response.data.data) {
          setNotificationsPaginated(response.data.data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchNotifications();
  }, []);

  const handleDeleteNotification = async (
    e: React.MouseEvent<HTMLButtonElement>,
    id: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setNotificationsPaginated((prev) =>
      prev.filter((notif) => notif.id !== id)
    );

    const response = await axiosInterceptor.delete(`/notification/delete`, {
      params: { id },
    });
    if (response.data.success === true) {
      toast.success("Notificación eliminada");
      markAsReadSingle(id);
    } else {
      toast.error("Error al eliminar la notificación");
      setNotificationsPaginated((prev) => [
        ...prev,
        notificationsPaginated.find((notif) => notif.id === id)!,
      ]);
    }
  };

  const handleNotificationClick = (
    e: React.MouseEvent<HTMLDivElement>,
    notification: Notification
  ) => {
    e.preventDefault();
    e.stopPropagation();

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

  return (
    <section className="w-[75%] md:w-[65%] mx-auto px-2 py-1 mt-5">
      <h1 className="text-[28px] tracking-tight text3 Dosis-Bold">
        Notificaciones
      </h1>
      <div className="flex flex-col max-w-[650px]">
        {notificationsPaginated.length !== 0 && (
          <div className="flex leading-4 justify-end items-center gap-1 mt-2">
            <button
              type="button"
              onClick={() => {
                markAsRead();
                setNotifications([]);
                setNotificationsPaginated((prev) =>
                  prev.map((n) => ({ ...n, read: true }))
                );
              }}
              title="Marcar notificaciones como leidas"
              className="cursor-pointer text3 Dosis-Bold text-[16px] text5 p-2"
            >
              Marcar como leido
            </button>
            <div className="w-[2px] h-[25px] bg-[#b53325]"></div>
            <button
              title="Notificaciones leidas"
              type="button"
              className="cursor-pointer text3 Dosis-Bold text-[16px] p-2 text5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#b53325"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-package-icon lucide-package"
              >
                <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
                <path d="M12 22V12" />
                <polyline points="3.29 7 12 12 20.71 7" />
                <path d="m7.5 4.27 9 5.15" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex flex-col mt-2 min-h-[100px]">
          {notificationsPaginated.length === 0 && (
            <>
              <img
                src="https://img.freepik.com/premium-photo/directly-shot-food-table_1048944-7767269.jpg"
                alt="Imagen de comida"
                className="w-full h-full max-h-[100px] rounded-[5px]  object-cover object-top "
              />

              <div className="flex flex-col gap-1 items-center mt-3 py-3 border-t border-b border-dashed border-[#bebebe]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4a4947"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-bell-minus-icon lucide-bell-minus"
                >
                  <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                  <path d="M15 8h6" />
                  <path d="M16.243 3.757A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673A9.4 9.4 0 0 1 18.667 12" />
                </svg>
                <p className="text5 Dosis-Bold text-[17px]">
                  "Todo en Calma por Aquí"
                </p>
                <p className="text4 text-[16px] ">
                  Tus alertas, mensajes y novedades importantes aparecerán en
                  este lugar.
                </p>
              </div>
            </>
          )}
          {notificationsPaginated.map((notification, index) => (
            <div
              key={index}
              onClick={(e) => handleNotificationClick(e, notification)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`relative flex flex-wrap gap-3 items-start cursor-pointer px-4 py-3 ${
                notification.read === false
                  ? "bg-[#dddddd] hover:bg-[#cccccc]"
                  : "hover:bg-[#e9e9e9]"
              }`}
            >
              <img
                src={
                  notification.metadata.imageURLs.community !== undefined
                    ? notification.metadata.imageURLs.community
                    : notification.metadata.imageURLs.user !== undefined
                    ? notification.metadata.imageURLs.user
                    : "https://placehold.co/40x40/000000/FFFFFF.png"
                }
                className="max-w-10 max-h-10 flex-[1] object-cover border rounded-full border-[#ebebeb]"
                alt="Imagen de perfil"
              />
              <div className="flex flex-col flex-[2] text-[15px]">
                <p className="Dosis-Bold text5">
                  {notification.metadata.title}
                </p>
                <p className="text4">{notification.message}</p>
                <q className="italic text4 text-[14px] ps-2 border-l-2 line-clamp-2 my-2">
                  {notification.metadata.message}
                </q>
                <span className="text4 text-[14px]">
                  {formatShortTime(new Date(notification.created_at))}
                </span>
              </div>

              {notification.metadata.imageURLs.post !== undefined && (
                <div className="max-w-[90px] max-h-[60px] flex-[1] overflow-hidden rounded-lg relative">
                  <div
                    className="absolute inset-0 bg-cover bg-center blur-md scale-150 brightness-50"
                    style={{
                      backgroundImage: `url(${
                        notification.metadata.imageURLs.post !== undefined
                          ? notification.metadata.imageURLs.post
                          : "https://placehold.co/90x60/000000/FFFFFF.png"
                      })`,
                    }}
                  />

                  <img
                    className="w-full h-full object-contain cursor-pointer relative z-10"
                    alt="Imagen del post"
                    src={
                      notification.metadata.imageURLs.post !== undefined
                        ? notification.metadata.imageURLs.post
                        : "https://placehold.co/90x60/000000/FFFFFF.png"
                    }
                  />
                </div>
              )}

              {hoveredIndex === index && (
                <div className="absolute rounded-full p-0.5 -top-5 border-1 border-[#a7a7a7] shadow-md right-0 w-fit h-fit bg-[#ffffff] z-10">
                  <button
                    onClick={(e) =>
                      handleDeleteNotification(e, notification.id)
                    }
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
        </div>
      </div>
    </section>
  );
};

export default UNotifications;
