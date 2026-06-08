import { axiosInterceptor } from "@api/interceptor/axios-interceptor";
import toast from "react-hot-toast";
import axios from "axios";

import type { AuthResponse, Post, PostComment, Recipe, Response, ResponseWithPagination } from "@/interface/global";
import { handleApiError } from "@/utils/apiErrorHandler";

// --- 1. INICIO DE SESIÓN ---
// ===================================
export const login = async (
  e: string,
  p: string,
  r: boolean,
  rt: string | null,
  d: string,
): Promise<AuthResponse> => {
  try {
    const response = await axiosInterceptor.post("/auth/login", {
      email: e,
      password: p,
      remember: r,
      token: rt,
      deviceId: d,
      platform: "web",
    });

    return {
      success: response.data.success ?? true,
      status: response.status,
      message: response.data.message,
      token: response.data.token,
      user: response.data.user,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 2. REGISTRO ---
// ===================================
export const register = async (
  e: string,
  p: string,
  d: string,
): Promise<AuthResponse> => {
  try {
    const response = await axiosInterceptor.post("/auth/register", {
      email: e,
      password: p,
      deviceId: d,
    });

    return {
      success: response.data.success ?? true,
      status: response.status,
      message: response.data.message,
      token: response.data.token,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 3. COMPLETAR PERFIL ---
// ===================================
export const completeProfile = async (
  name: string,
  foodPreferences: number[],
  communityPreferences: number[],
  tempToken: string,
): Promise<AuthResponse> => {
  try {
    const response = await axiosInterceptor.post("/auth/complete-profile", {
      name,
      foodPreferences,
      communityPreferences,
      tempToken,
    });

    return {
      success: response.data.success ?? true,
      status: response.status,
      message: response.data.message,
      token: response.data.token,
      user: response.data.user,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 4. CERRAR SESIÓN ---
// ===================================
export const logout = async () => {
  try {
    const response = await toast.promise(
      axiosInterceptor.post("/auth/logout", {}, { withCredentials: true }),
      {
        loading: "Cerrando sesión...",
        success: "Sesión cerrada exitosamente",
        error: (err) => err.response?.data?.message || "Error al cerrar sesión",
      },
    );
    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      toast.error(err.response?.data?.message || "Error al cerrar sesión");
    } else {
      toast.error("Error desconocido");
    }
  }
};

// --- 5. OBTENER USUARIO POR ID ---
// ===================================
export const getUserById = async (user_id: string): Promise<Response> => {
  try {
    const response = await axiosInterceptor.get(`/auth/${user_id}`);

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

type Tabs = "posts" | "recipes" | "comments" | "reviews";
type GlobalSearch = Post | Recipe | PostComment;

// --- 6. OBTENER POSTS, RECETAS, COMMENTARIOS, RESEÑAS DE UN USUARIO ---
// ===================================
export const getUserSearch = async (
  user_id: string,
  query: string = "",
  tab: Tabs,
  page: number = 1,
): Promise<ResponseWithPagination<GlobalSearch[]>> => {
  try {
    const response = await axiosInterceptor.get(`/auth/${user_id}/search`, {
      params: {
        query,
        tab,
        page,
      },
    });

    return {
      success: response.data.success ?? true,
      status: response.status,
      message: response.data.message,
      data: response.data.data,
      pagination: response.data.pagination,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 7. OBTENER DATOS DEL USUARIO ---
// ===================================
export const getMe = async () => {
  try {
    const response = await axiosInterceptor.get("/auth/me", {
      withCredentials: true,
    });
    return response.data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      console.error(err.response?.data?.message);
    } else {
      console.error("Error desconocido");
    }
    throw err;
  }
};
