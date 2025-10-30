import { axiosInterceptor } from "@interceptor/axios-interceptor";
import type { Response } from "@interface/global";

import axios from "axios";

export const getCommunityTags = async (): Promise<Response | null> => {
  try {
    const response = await axiosInterceptor.get("/community-tags");

    return response.data as Response;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("Error en getCommunityTags:", err.message);
    }
    return null;
  }
};

export const getByCategoryId = async (
  id: number
): Promise<Response | null> => {
  try {
    const response = await axiosInterceptor.get(
      `/community-tags/tags/by-category`,
      {
        params: { id },
      }
    );
    
    return response.data as Response;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(
        err.response?.data?.message || "Error al obtener la etiqueta"
      );
    } else {
      console.log("Error desconocido");
    }
    return null;
  }
};

export const createCommunityTag = async (
  data: string
): Promise<Response | null> => {
  try {
    const response = await axiosInterceptor.post("/community-tags", { data });

    if (response.data?.success === false) {
      return response.data.message;
    } else {
      return response.data;
    }
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message || "Error al crear la etiqueta");
    } else {
      console.log("Error desconocido");
    }
    return null;
  }
};

export const updateCommunityTag = async (
  id: string,
  data: string
): Promise<Response | null> => {
  try {
    const response = await axiosInterceptor.put(`/community-tags/${id}`, {
      data,
    });

    if (response.data?.success === false) {
      return response.data.message;
    } else {
      return response.data;
    }
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(
        err.response?.data?.message || "Error al actualizar la etiqueta"
      );
    } else {
      console.log("Error desconocido");
    }
    return null;
  }
};

export const deleteCommunityTag = async (
  id: string
): Promise<Response | null> => {
  try {
    const response = await axiosInterceptor.delete(`/community-tags/${id}`);

    if (response.data?.success === false) {
      return response.data.message;
    } else {
      return response.data;
    }
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(
        err.response?.data?.message || "Error al eliminar la etiqueta"
      );
    } else {
      console.log("Error desconocido");
    }
    return null;
  }
};
