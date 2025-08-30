import { axiosInterceptor } from "../interceptor/axios-interceptor";
import toast from "react-hot-toast";

import type { Response } from "../interface/global";

import axios from "axios";

export const createCommunity = async (
  name: string,
  description: string,
  imageUrl: string | null,
  themeColor: string,
  visibility: string,
  selectedTags: number[],
  creatorId: number
): Promise<Response | null> => {
  try {
    const response = await toast.promise(
      axiosInterceptor.post("/community/create", {
        name,
        description,
        imageUrl,
        themeColor,
        visibility,
        selectedTags,
        creatorId,
      }),
      {
        loading: "Creando comunidad...",
        success: (res) => res.data.message || "Comunidad creada exitosamente",
        error: (err) =>
          err.response?.data?.message || "Error al crear comunidad",
      }
    );
    return response.data as Response;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      toast.error(err.response?.data?.message || "Error al crear comunidad");
    } else {
      toast.error("Error desconocido");
    }
    return null;
  }
};

export const getCommunity = async (name: string): Promise<Response | null> => {
  try {
    const response = await axiosInterceptor.get("/community/", {
      params: { name },
    });
    return response.data as Response;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message || "Error al obtener comunidad");
    }
    return null;
  }
};

export const joinCommunity = async (
  user_id: number,
  community_id: number
): Promise<Response | null> => {
  try {
    const response = await axiosInterceptor.post("/community/join", {
      user_id,
      community_id,
    });

    if (response.data.success === true) {
      toast.success(response.data.message);
    }

    return response.data as Response;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      toast.error(err.response?.data?.message);
    }
    return null;
  }
};

export const getUserCommunities = async (
  user_id: number
): Promise<Response | null> => {
  try {
    const response = await axiosInterceptor.get("/community/user", {
      params: { user_id },
    });
    
    return response.data as Response;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message || "Error al obtener comunidad");
    }
    return null;
  }
};
