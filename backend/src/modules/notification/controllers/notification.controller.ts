import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";

export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  /** GET /api/notification */
  async getUserNotifications(req: Request, res: Response) {
    try {
      const readed = req.query.readed;
     
      const user_id = (req as any).user?.id;

      if (!user_id) {
        return res
          .status(401)
          .json({ success: false, message: "No autorizado" });
      }
      

      const notifications =
        await this.notificationService.getUserNotifications(user_id, String(readed));
      res.status(200).json({ success: true, data: notifications });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /** PUT /api/notification/status */
  async changeNotificationStatus(req: Request, res: Response) {
    try {
      const { community_id, type, value } = req.body;
      const user_id = (req as any).user?.id;
      const notification =
        await this.notificationService.changeNotificationStatus(
          community_id,
          user_id,
          type,
          value
        );
      res.status(200).json({ success: true, data: notification });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /** GET /api/notification/unread-count */
  async getUnreadCount(req: Request, res: Response) {
    try {
      const user_id = (req as any).user?.id;

      if (!user_id) {
        return res
          .status(401)
          .json({ success: false, message: "No autorizado" });
      }

      const count = await this.notificationService.getUnreadCount(user_id);
      res.status(200).json({ success: true, data: count });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /** PUT /api/notification/mark-all-as-read */
  async markAllAsRead(req: Request, res: Response) {
    try {
      const user_id = (req as any).user?.id;

      if (!user_id) {
        return res
          .status(401)
          .json({ success: false, message: "No autorizado" });
      }

      await this.notificationService.markAllasRead(user_id);
      res.status(200).json({
        success: true,
        message: "Notificaciones marcadas como leídas",
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /** PUT /api/notification/read */
  async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.body;
      const user_id = (req as any).user?.id;

      if (!user_id) {
        return res
          .status(401)
          .json({ success: false, message: "No autorizado" });
      }

      await this.notificationService.markAsRead(String(id), user_id);
      res
        .status(200)
        .json({ success: true, message: "Notificación marcada como leída" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /** DELETE /api/notification */
  async deleteAllNotifications(req: Request, res: Response) {
    try {
      const user_id = (req as any).user?.id;

      if (!user_id) {
        return res.status(401).json({ error: "No autorizado" });
      }

      await this.notificationService.deleteAllNotifications(user_id);
      return res.status(200).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /** DELETE /api/notification/delete */
  async deleteNotification(req: Request, res: Response) {
    try {
      const { id } = req.query;
      const user_id = (req as any).user?.id;

      if (!user_id) {
        return res.status(401).json({ error: "No autorizado" });
      }

      await this.notificationService.deleteNotification(String(id), user_id);
      return res.status(200).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
