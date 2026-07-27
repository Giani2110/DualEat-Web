import React, { createContext, useEffect, useMemo, useState } from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "@hooks/useAuth";

import toast from "react-hot-toast";
import type { Notification } from "@interface/global";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  readAllNotifications,
  markAsRead as markSingleAPI,
  deleteNotification as deleteAPI,
} from "@/services/notification.api";

type NotificationsContextType = {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: () => Promise<void>;
  markAsReadSingle: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;

  isLoading: boolean;
  refetch: () => Promise<void>;
};

export const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

export const NotificationsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { socket } = useSocket();
  const { user } = useAuth();

  const queryClient = useQueryClient();

  const queryKey = useMemo(() => ["notifications", user?.id], [user?.id]);

  const [unreadCount, setUnreadCount] = useState(0);

  const {
    data: notifications = [],
    refetch,
    isLoading,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await getNotifications();
      return response.data as Notification[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!notifications) return;
    const unread = notifications.filter((n: Notification) => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Obtener notificaciones iniciales
  useEffect(() => {
    if (!socket || !user) return;

    const onNew = (notification: Partial<Notification>) => {
      queryClient.setQueryData(queryKey, (old: any) => {
        return old ? [notification, ...old] : [notification];
      });
    };

    const onLocalNew = (data: any) => {
      const customNotif: any = {
        id: "local_notif_" + Date.now(),
        message: data.message,
        read: false,
        title: data.title,
        content_type: "LOCAL",
        metadata: { title: data.title },
        created_at: new Date().toISOString(),
      };
      queryClient.setQueryData(queryKey, (old: any) => {
        return old ? [customNotif, ...old] : [customNotif];
      });
      toast.success(`${data.title}: ${data.message}`, { duration: 4000 });
    };

    socket.on("new_post", onNew);
    socket.on("new_comment", onNew);

    // new_order

    if (user?.is_business) {
      socket.on("new_category_local", onLocalNew);
      socket.on("new_review_local", onLocalNew);
    }
    return () => {
      socket.off("new_post", onNew);
      socket.off("new_comment", onNew);
      socket.off("new_notification", onNew);
      if (user?.is_business) {
        socket.off("new_category_local", onLocalNew);
        socket.off("new_review_local", onLocalNew);
      }
    };
  }, [socket, user, queryClient, queryKey]);

  // Marcar todas como leídas
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await readAllNotifications();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previousNotifications = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: Notification[]) => {
        if (!old) return old;

        return old.map((n) => ({ ...n, read: true })) as Notification[];
      });
      return { previousNotifications };
    },
    onError: (err, _, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(queryKey, context.previousNotifications);
      }
      toast.error("Error al marcar las notificaciones como leídas");
    },
    onSuccess: () => {
      toast.success("Notificaciones marcadas como leídas");
    },
  });

  // Marcar una sola como leída
  const markSingleAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await markSingleAPI(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Notification[]>(queryKey);

      queryClient.setQueryData(queryKey, (old: Notification[]) => {
        if (!old) return old;

        return old.map((n) => {
          if (n.id === id) {
            return { ...n, read: true };
          }
          return n;
        }) as Notification[];
      });
      return { previous };
    },
    onError: (err, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteAPI(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: Notification[]) => {
        return old ? old.filter((n: Notification) => n.id !== id) : [];
      });
      return { previous };
    },
    onError: (err, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error("Error al eliminar la notificación");
    },
    onSuccess: () => {
      toast.success("Notificación eliminada");
    },
  });

  const markAsRead = async () => {
    await markAllAsReadMutation.mutateAsync();
  };

  const markAsReadSingle = async (id: string) => {
    await markSingleAsReadMutation.mutateAsync(id);
  };

  const deleteNotification = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleRefetch = async () => {
    await refetch();
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAsReadSingle,
        deleteNotification,
        isLoading,
        refetch: handleRefetch,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
