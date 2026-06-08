import { axiosInterceptor } from "@/api/interceptor/axios-interceptor";
import type { Response } from "@/interface/global";
import { handleApiError } from "@/utils/apiErrorHandler";

// --- 1. OBTENER CATEGORIAS (FOOD)---
// ===================================
export const getFoodCategories = async (): Promise<Response> => {
  try {
    const response = await axiosInterceptor.get("/food-categories/categories");

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 2. OBTENER CATEGORIAS DE TAGS (TAG-CATEGORY)---
// ===================================
export const getTagCategories = async (): Promise<Response> => {
  try {
    const response = await axiosInterceptor.get(`/community-tags/categories`);

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 3. OBTENER TAGS (TAGS)---
// ===================================
export const getTags = async (): Promise<Response> => {
  try {
    const response = await axiosInterceptor.get("/community-tags/tags");

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};

// --- 4. OBTENER TAGS POR CATEGORIA (TAGS) ---
// ===================================
export const getTagsByCategoryId = async (
  category_id: number,
): Promise<Response> => {
  try {
    const response = await axiosInterceptor.get(
      `/community-tags/tags/category/${category_id}`,
    );

    return {
      success: response.data.success ?? true,
      status: response.status,
      data: response.data.data,
    };
  } catch (err: any) {
    return handleApiError(err);
  }
};