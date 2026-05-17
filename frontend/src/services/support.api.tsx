import { axiosInterceptor } from "@/api/interceptor/axios-interceptor";
import axios from "axios";

export const createSupportTicket = async (localId: string, type: string) => {
  try {
    const { data } = await axiosInterceptor.post("/support/tickets", { localId, type });
    return data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message || "Error creating ticket");
    }
    return null;
  }
};

export const getLocalTickets = async (localId: string) => {
  try {
    const { data } = await axiosInterceptor.get(`/support/tickets/local/${localId}`);
    return data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message || "Error fetching local tickets");
    }
    return null;
  }
};

export const getAdminTickets = async () => {
  try {
    const { data } = await axiosInterceptor.get("/support/tickets/admin");
    return data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message || "Error fetching admin tickets");
    }
    return null;
  }
};

export const getTicketMessages = async (ticketId: string) => {
  try {
    const { data } = await axiosInterceptor.get(`/support/tickets/${ticketId}/messages`);
    return data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message || "Error fetching messages");
    }
    return null;
  }
};

export const addSupportMessage = async (ticketId: string, senderId: string, senderRole: 'LOCAL' | 'ADMIN', content: string) => {
  try {
    const { data } = await axiosInterceptor.post(`/support/tickets/${ticketId}/messages`, {
      senderId,
      senderRole,
      content,
    });
    return data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message || "Error adding message");
    }
    return null;
  }
};

export const updateTicketStatus = async (ticketId: string, status: string) => {
  try {
    const { data } = await axiosInterceptor.patch(`/support/tickets/${ticketId}/status`, { status });
    return data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message || "Error updating ticket status");
    }
    return null;
  }
};

export const markTicketMessagesAsRead = async (ticketId: string, roleToMark: 'LOCAL' | 'ADMIN') => {
  try {
    const { data } = await axiosInterceptor.post(`/support/tickets/${ticketId}/read`, { roleToMark });
    return data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message || "Error marking messages as read");
    }
    return null;
  }
};
