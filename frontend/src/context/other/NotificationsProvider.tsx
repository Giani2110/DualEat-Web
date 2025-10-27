/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useEffect, useState } from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "@hooks/useAuth";

import { axiosInterceptor } from "@interceptor/axios-interceptor";
import toast from "react-hot-toast";
import type { Notification } from "@interface/global";

type NotificationsContextType = {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  unreadCount: number;
  markAsRead: () => Promise<void>;
  markAsReadSingle: (id: string) => Promise<void>;
  clearNotifications: () => void;
};

// 🔹 Crear el contexto
export const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

// 🔹 Provider
export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Obtener notificaciones iniciales
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!user) return;
        else {
          const response = await axiosInterceptor.get("/notification/", {
            params: { readed: "false" },
          });
          if (response.data?.success && response.data.data) {
            setNotifications(response.data.data);
            setUnreadCount(response.data.data.length);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();
  }, [user]);

  // Escuchar eventos en tiempo real
  useEffect(() => {
    if (!socket) return;

    const onNew = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("new_community_post", onNew);
    socket.on("new_comment", onNew);

    return () => {
      socket.off("new_community_post", onNew);
      socket.off("new_comment", onNew);
    };
  }, [socket]);

  // Marcar todas como leídas
  const markAsRead = async () => {
    setUnreadCount(0);
    setNotifications([]);
    try {
      const response = await axiosInterceptor.put(
        "/notification/mark-all-as-read"
      );
      if (response.data?.success)
        toast.success("Notificaciones marcadas como leídas");
    } catch (err) {
      toast.error("Error al marcar las notificaciones como leídas");
      console.error(err);
    }
  };

  // Marcar una sola como leída
  const markAsReadSingle = async (notificationId: string) => {
    try {
      const response = await axiosInterceptor.put(`/notification/read`, {
        id: notificationId,
      });
      if (response.data?.success) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      }
    } catch (err) {
      toast.error("Error al marcar la notificación como leída");
      console.error(err);
    }
  };

  // Limpiar todas las notificaciones (solo UI)
  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        setNotifications,
        unreadCount,
        markAsRead,
        markAsReadSingle,
        clearNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
