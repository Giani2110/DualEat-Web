import type { MinimalUser } from "./global";

export interface SupportTicket {
  id: string;
  local_id: string;
  type: "PAYMENT" | "WEB" | "QUERY" | "OTHER";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  created_at: string;
  updated_at: string;
  local?: { name: string; image_url: string };
  _count?: { messages: number };
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_role: "LOCAL" | "ADMIN";
  content: string;
  read: boolean;
  created_at: string;
  sender: MinimalUser;
}
