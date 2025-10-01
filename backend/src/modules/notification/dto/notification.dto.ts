import { Notification } from "@prisma/client";

export interface CreateNotificationDTO {
    user_id: string;
    content_type: Notification["content_type"];
    content_id: string;
    message: string;
    metadata?: any;
}