import { axiosInterceptor } from "@api/interceptor/axios-interceptor";
import type { Response } from "@/interface/global";
import { handleApiError } from "@/utils/apiErrorHandler";

// --- 1. OBTENER NOTIFICACIONES ---
// ===================================
export const getNotifications = async (): Promise<Response> => {
  try {
    const response = await axiosInterceptor.get("/notification");

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 2. ELIMINAR NOTIFICACIÓN ---
// ===================================
export const deleteNotification = async (id: string): Promise<Response> => {
  try {
    const response = await axiosInterceptor.delete(`/notification/${id}`);

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 3. LEER TODAS LAS NOTIFICACIONES ---
// ===================================
export const readAllNotifications = async (): Promise<Response> => {
  try {
    const response = await axiosInterceptor.patch(`/notification/mark-all-as-read`);

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 4. OBTENER COUNT DE NOTIFICACIONES SIN LEER ---
// ===================================
export const getUnreadCount = async (): Promise<Response> => {
  try {
    const response = await axiosInterceptor.get(`/notification/unread-count`);

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};