import { axiosInterceptor } from "../interceptor/axios-interceptor";
import toast from "react-hot-toast";
import axios from "axios";

import type { User } from "../interface/global";

export interface AuthResponse {
  success: boolean;
  message: string;
  temp_token?: string;
  next_step?: string;
  user?: User;
}

export const login = async (
  email: string,
  password: string,
  rememberMe: boolean,
  recaptchaToken: string | null
): Promise<AuthResponse | null> => {
  try {
    const response = await axiosInterceptor.post(
      "/auth/login",
      {
        email,
        password,
        rememberMe,
        recaptchaToken,
      },
      { withCredentials: true }
    );

    if (response.data?.success === false) {
      toast.error(response.data.message);
      return null;
    } else {
      toast.success(response.data.message);
      return response.data.user;
    }
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      toast.error(err.response?.data?.message || "Error al iniciar sesión");
    } else {
      toast.error("Error desconocido");
    }
    return null;
  }
};

export const register = async (
  email: string,
  password: string
): Promise<AuthResponse | null> => {
  try {
    const response = await toast.promise(
      axiosInterceptor.post("/auth/register", { email, password }),
      {
        loading: "Registrando...",
        success: (res) => res.data.message || "Registro exitoso",
        error: (err) => err.response?.data?.message || "Error al registrar",
      }
    );

    return response.data as AuthResponse;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      toast.error(err.response?.data?.message || "Error desconocido");
    } else {
      toast.error("Error al registrar");
    }
    return null;
  }
};

export const completeProfile = async (
  name: string,
  foodPreferences: number[],
  communityPreferences: number[],
  tempToken: string
) => {
  try {
    const response = await toast.promise(
      axiosInterceptor.post(
        "/auth/complete-profile",
        {
          name,
          foodPreferences,
          communityPreferences,
          tempToken,
        },
        { withCredentials: true }
      ),
      {
        loading: "Completando perfil...",
        success: (res) => res.data.message || "Perfil completado exitosamente",
        error: (err) =>
          err.response?.data?.message || "Error al completar perfil",
      }
    );

    return response.data as AuthResponse;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      toast.error(err.response?.data?.message || "Error al completar perfil");
    } else {
      toast.error("Error desconocido");
    }
    return null;
  }
};

export const logout = async () => {
  try {
    const response = await toast.promise(
      axiosInterceptor.post("/auth/logout", {}, { withCredentials: true }),
      {
        loading: "Cerrando sesión...",
        success: "Sesión cerrada exitosamente",
        error: (err) => err.response?.data?.message || "Error al cerrar sesión",
      }
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

export const getMe = async () => {
  try {
    const response = await axiosInterceptor.get("/auth/me", {
      withCredentials: true,
    });
    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("Error al obtener perfil:", err.response?.data?.message);
    } else {
      console.error("Error desconocido");
    }
    throw err;
  }
};
