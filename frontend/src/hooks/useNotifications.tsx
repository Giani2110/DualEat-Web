import { useEffect, useState } from "react";
import { useSocket } from "../context/other/SocketContext";
import { axiosInterceptor } from "../interceptor/axios-interceptor";
import toast from "react-hot-toast";

import type { Notification } from "../interface/global";

export const useNotifications = () => {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Cargar notificaciones
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInterceptor.get("/notification/", {
          params: {
            readed: "false",
          },
        });

        if (response.data.success === true && response.data.data) {
          setNotifications(response.data.data);
          setUnreadCount(response.data.data.length);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Escuchar notificaciones de nuevos posts
    socket.on("new_community_post", (notification: Notification) => {
      console.log("[Notification] Nueva notificación recibida:", notification);

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on("new_comment", (notification: Notification) => {
      console.log("[Notification] Nueva notificación recibida:", notification);

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("new_community_post");
    };
  }, [socket]);

  const markAsRead = async () => {
    setUnreadCount(0);
    setNotifications([]);
    try {
      const response = await axiosInterceptor.put("/notification/mark-all-as-read");

      if (response.data?.success === true) {
        toast.success("Notificaciones marcadas como leídas");
      }
    } catch (error) {
      toast.error("Error al marcar las notificaciones como leídas");
      console.error(error);
    }
  };

  const markAsReadSingle = async (notificationId: string) => {
    try {
      const response = await axiosInterceptor.put(`/notification/read`, {
        id: notificationId,
      });

      if (response.data.success === true) {
        setUnreadCount((prev) => prev - 1);
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== notificationId)
        );
      }
    } catch (error) {
      toast.error("Error al marcar la notificación como leída");
      console.error(error);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAsReadSingle,
    clearNotifications,
  };
};
