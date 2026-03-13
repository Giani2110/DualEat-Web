import { axiosInterceptor } from "@api/interceptor/axios-interceptor";
import { isAxiosError } from "axios";
import type { Response } from "@interface/global";

import axios from "axios";


// --- 1. OBTENER CATEGORIAS (FOOD) ---
// ===================================
export const getFoodCategories = async (): Promise<Response | null> => {
  try {
    const response = (await axiosInterceptor.get(
      "/food-categories/categories",
    ));
    return response.data as Response;
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      console.log("Axios error:", err.response?.data || err.message);
    }
    return null;
  }
};

// --- 2. OBTENER CATEGORIAS (TAGS) ---
// ===================================
export const getTagCategories = async (): Promise<Response | null> => {
  try {
    const response = (await axiosInterceptor.get(
      "/community-tags/tags",
    ));

    return response.data as Response;
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      console.log("Axios error:", err.response?.data || err.message);
    }
    return null;
  }
};


export const getCategoriesTag = async (): Promise<Response | null> => {
  try {
    const response = await axiosInterceptor.get("/community-tags/categories");
    return response.data as Response;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message || "Error al obtener categorias");
    }
    return null;
  }
};

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

export const getByCategoryId = async (id: number): Promise<Response | null> => {
  try {
    const response = await axiosInterceptor.get(
      `/community-tags/tags/by-category`,
      {
        params: { id },
      },
    );

    return response.data as Response;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(
        err.response?.data?.message || "Error al obtener la etiqueta",
      );
    } else {
      console.log("Error desconocido");
    }
    return null;
  }
};

export const createCommunityTag = async (
  data: string,
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
  data: string,
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
        err.response?.data?.message || "Error al actualizar la etiqueta",
      );
    } else {
      console.log("Error desconocido");
    }
    return null;
  }
};

export const deleteCommunityTag = async (
  id: string,
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
        err.response?.data?.message || "Error al eliminar la etiqueta",
      );
    } else {
      console.log("Error desconocido");
    }
    return null;
  }
};
