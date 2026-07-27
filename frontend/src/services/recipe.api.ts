import { handleApiError } from "@/utils/apiErrorHandler";
import { axiosInterceptor } from "@api/interceptor/axios-interceptor";
import type { Recipe, Response, ResponseWithPagination } from "@interface/global";

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
export const getRecipeById = async (recipe_id: string): Promise<Response> => {
  try {
    const response = await axiosInterceptor.get(`/recipe/${recipe_id}`);

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 3. BUSCAR RECETAS ---
// ===================================
export const searchRecipes = async (query: string, page: number = 1): Promise<ResponseWithPagination<Recipe[]>> => {
  try {
    const response = await axiosInterceptor.get(`/recipe/search`, {
      params: {
        query: query.trim(),
        page: page,
      }
    });

    return {
      success: response.data.success ?? true,
      status: response.status,
      message: response.data.message,
      data: response.data.data,
      pagination: response.data.pagination
    };
  } catch (err: any) {
    throw handleApiError(err);
  }
};


// --- 4. OBTENER RECETAS DEL USUARIO ---
// ===================================
export const getUserRecipes = async (): Promise<Response<Recipe[]>> => {
  try {
    const response = await axiosInterceptor.get(`/recipe/user`);

    return {
      success: response.data.success ?? true,
      status: response.status,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (err: any) {
    throw handleApiError(err);
  }
};