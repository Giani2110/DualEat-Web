import { useEffect, useState } from "react";
import { useSocket } from "../context/other/SocketContext";
import { axiosInterceptor } from "../interceptor/axios-interceptor";
import toast from "react-hot-toast";

export interface Notification {
  id: string;
  user_id: string;
  content_type: string;
  content_id: string;
  metadata: NotificationMetadata;
  created_at: string;
  read: boolean;
  message: string;
}
export interface NotificationMetadata {
  communityId: string;
  postTitle: string;
  postMessage: string;
  postURLs: string[];
  slug: string;
}

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

    return () => {
      socket.off("new_community_post");
    };
  }, [socket]);

  const markAsRead = () => {
    setUnreadCount(0);
    setNotifications([]);
    try {
      axiosInterceptor.put("/notification/mark-all-as-read");
    } catch (error) {
      toast.error("Error al marcar las notificaciones como leídas");
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
    clearNotifications,
  };
};
