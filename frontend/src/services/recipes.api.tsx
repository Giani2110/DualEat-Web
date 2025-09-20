import { axiosInterceptor } from "../interceptor/axios-interceptor";

import type { Response } from "../interface/global";

import axios from "axios";

export const getAllIngredients = async (): Promise<Response | null> => {
  try {
    const response = await axiosInterceptor.get("/recipe/ingredients");
    return response.data as Response;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message || "Error al obtener recetas");
    }
    return null;
  }
};

export const getAllUnits = async (): Promise<Response | null> => {
  try {
    const response = await axiosInterceptor.get("/recipe/units");
    return response.data as Response;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message || "Error al obtener recetas");
    }
    return null;
  }
};

export const getRecipeByName = async (
  name: string,
  user_id: number,
  community_id: number

): Promise<Response | null> => {
  try {
    const response = await axiosInterceptor.get("/recipe/", {
      params: { name, user_id, community_id },
    });
    return response.data as Response;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message || "Error al obtener recetas");
    }
    return null;
  }
};
