import { axiosInterceptor } from "@/api/interceptor/axios-interceptor";
import type {
  ChatSessionData,
  ChatSessionResponse,
  Ingredient,
  Response,
} from "@/interface/global";
import { handleApiError } from "@/utils/apiErrorHandler";

// --- 1. CONSULTAS AL CHAT ---
// ===================================
export const ask = async (
  question: string,
  chat_id: string | null,
  recipe_id: string | null,
  conversation: ChatSessionData[],
  ingredients: Ingredient[],
): Promise<Response<ChatSessionResponse>> => {
  try {
    const response = await axiosInterceptor.post(`/chat/ask`, {
      question,
      chat_id,
      recipe_id,
      conversation,
      ingredients,
    });

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 2. OBTENER CHAT POR ID ---
// ===================================
export const getById = async (chat_id: string): Promise<Response> => {
  try {
    const response = await axiosInterceptor.get(`/chat/${chat_id}`);

    console.log("Chat Data", response.data);

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 3. OBTENER HISTORIAL DEL USUARIO ---
// ===================================
export const getHistory = async (search?: string): Promise<Response> => {
  try {
    const response = await axiosInterceptor.get(`/chat/`, {
      params: { search },
    });

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 4. ELIMINAR CHAT ---
// ===================================
export const deleteChat = async (chat_id: string): Promise<Response> => {
  try {
    const response = await axiosInterceptor.delete(`/chat/${chat_id}`);

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 4. EDITAR TÍTULO DEL CHAT ---
// ===================================
export const editTitle = async (
  chat_id: string,
  title: string,
): Promise<Response> => {
  try {
    const normalize = title.trim();

    const response = await axiosInterceptor.put(`/chat/${chat_id}/title`, {
      title: normalize,
    });

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};
