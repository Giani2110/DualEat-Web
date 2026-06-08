import { handleApiError } from "@/utils/apiErrorHandler";
import { axiosInterceptor } from "@api/interceptor/axios-interceptor";
import type { Response } from "@interface/global";

// --- 1. OBTENER TODOS LOS INGREDIENTES ---
// ===================================
export const getAllIngredients = async (): Promise<Response> => {
  try {
    const response = await axiosInterceptor.get(`/recipe/ingredients`);

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 2. OBTENER RECETA POR ID ---
// ===================================
export const getRecipeById = async (recipeId: string): Promise<Response> => {
  try {
    const response = await axiosInterceptor.get(`/recipe/${recipeId}`);

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};