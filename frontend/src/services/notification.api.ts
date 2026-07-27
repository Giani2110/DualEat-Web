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
      message: response.data.message,
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
      message: response.data.message,
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
    const response = await axiosInterceptor.patch(
      `/notification/mark-all-as-read`,
    );

    return {
      success: response.data.success ?? true,
      status: response.status,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 4. LEER UNA NOTIFICACIÓN ---
// ===================================
export const markAsRead = async (id: string): Promise<Response> => {
  try {
    const response = await axiosInterceptor.patch(`/notification/read/${id}`);

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 5. CAMBIAR ESTADO DE LAS NOTIFICACIONES ---
// ===================================
export const changeStatus = async (
  community_id: string | undefined,
  type: "member" | "user",
  value: "ALWAYS" | "NONE",
): Promise<Response> => {
  try {
    const response = await axiosInterceptor.patch(`/notification/status`, {
      community_id,
      type,
      value,
    });

    return {
      success: response.data.success ?? true,
      message: response.data.message,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};
