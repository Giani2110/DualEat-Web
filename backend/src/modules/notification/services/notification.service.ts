import { prisma } from "../../../prisma/prisma";
import type { CreateNotificationDTO } from "../dto/notification.dto";

export class NotificationService {
  constructor() {}

  /** GET USER NOTIFICATIONS */
  async getUserNotifications(user_id: string, readed: string) {
    try {
      const result = await prisma.notification.findMany({
        where: {
          user_id,
          deleted: false,
          ...(readed === "true" && { read: true }),
          ...(readed === "false" && { read: false }),
        },
        orderBy: {
          created_at: "desc",
        },
      });

      
      return result;
    } catch (error) {
      throw new Error(`Error al obtener notificaciones: ${error}`);
    }
  }

  /** CHANGE NOTIFICATION STATUS  */
  async changeNotificationStatus(
    community_id: string,
    user_id: string,
    type: string,
    value: "RARE" | "NONE" | "FREQUENT"
  ) {
    try {
      if (type === "member") {
        const result = await prisma.communityMember.update({
          where: {
            user_id_community_id: {
              user_id: user_id,
              community_id: community_id,
            },
          },
          data: {
            receives_notifications: value,
          },
        });
        return result;
      }

      if (type === "user") {
        const result = await prisma.user.update({
          where: {
            id: user_id,
          },
          data: {
            notificationsPref: value,
          },
        });
        return result;
      }
    } catch (error) {
      throw new Error(`Error al cambiar las preferencias: ${error}`);
    }
  }

  /** GET UNREAD COUNT */
  async getUnreadCount(user_id: string) {
    try {
      const result = await prisma.notification.count({
        where: {
          user_id,
          deleted: false,
          read: false,
        },
      });
      return result;
    } catch (error) {
      throw new Error(`Error al obtener notificaciones: ${error}`);
    }
  }

  /** MARK ALL AS READ */
  async markAllasRead(user_id: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          user_id,
          deleted: false,
        },
        data: {
          read: true,
        },
      });
      return result;
    } catch (error) {
      throw new Error(`Error al obtener notificaciones: ${error}`);
    }
  }

  /** MARK AS READ */
  async markAsRead(id: string, user_id: string) {
    try {
      const result = await prisma.notification.update({
        where: {
          id,
          user_id,
        },
        data: {
          read: true,
        },
      });
      return result;
    } catch (error) {
      throw new Error(`Error al obtener notificaciones: ${error}`);
    }
  }

  /** DELETE ALL NOTIFICATIONS */
  async deleteAllNotifications(user_id: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          user_id,
          deleted: false,
        },
        data: {
          deleted: true,
        },
      });
      return result;
    } catch (error) {
      throw new Error(`Error al obtener notificaciones: ${error}`);
    }
  }

  /** DELETE NOTIFICATION */
  async deleteNotification(id: string, user_id: string) {
    try {
      const result = await prisma.notification.update({
        where: {
          id,
          user_id,
        },
        data: {
          deleted: true,
        },
      });
      return result;
    } catch (error) {
      throw new Error(`Error al obtener notificaciones: ${error}`);
    }
  }

  /** CREATE NOTIFICATION (usado internamente por otros servicios) */
  async createNotification(data: CreateNotificationDTO) {
    try {
      const notification = await prisma.notification.create({
        data: {
          user_id: data.user_id,
          content_type: data.content_type,
          content_id: data.content_id,
          message: data.message,
          metadata: data.metadata || {},
        },
      });

      return notification;
    } catch (error) {
      throw new Error(`Error al crear notificación: ${error}`);
    }
  }

  /** CREATE MANY NOTIFICATIONS (usado por post.service para múltiples usuarios) */
  async createManyNotifications(notifications: CreateNotificationDTO[]) {
    try {
      const result = await prisma.notification.createMany({
        data: notifications.map((notif) => ({
          user_id: notif.user_id,
          content_type: notif.content_type,
          content_id: notif.content_id,
          message: notif.message,
          metadata: notif.metadata || {},
        })),
      });

      return result;
    } catch (error) {
      throw new Error(`Error al crear notificaciones: ${error}`);
    }
  }
}
