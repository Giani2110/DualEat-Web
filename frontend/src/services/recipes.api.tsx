import { axiosInterceptor } from "../interceptor/axios-interceptor";
import type { Response, PaginationInfo, CommentIA } from "../interface/global";

import axios from "axios";

interface ResponseAI<T = unknown> {
  success: boolean;
  comment: string;
  pagination?: PaginationInfo;
  data?: T;
}

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
  community_id: string
): Promise<Response | null> => {
  try {
    const response = await axiosInterceptor.get("/recipe/", {
      params: { name, community_id },
    });
    return response.data as Response;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message || "Error al obtener recetas");
    }
    return null;
  }
};

export const getUserRecipes = async (
  user_id: string
): Promise<Response | null> => {
  try {
    const response = await axiosInterceptor.get("/recipe/user", {
      params: { user_id },
    });
    return response.data as Response;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message || "Error al obtener recetas");
    }
    return null;
  }
};

export const askOllama = async (
  question: string,
  type: string,
  ingredients: number[],
  page: number,
  conversation: CommentIA[]
): Promise<ResponseAI | null> => {
  try {
    const limitedConversation = conversation.slice(-10);

    const mappedConversation = limitedConversation.map((msg) => ({
      role: msg.role === "ai" ? "assistant" : "user",
      content: msg.text,
    }));

    const { data } = await axiosInterceptor.post<ResponseAI>("/recipe/ask", {
      question,
      type,
      ingredients,
      page,
      conversation: mappedConversation,
    });

    return data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(
        err.response?.data?.error || "Error al obtener respuesta de la IA"
      );
    }
    return null;
  }
};

export const askRecipe = async (
  question: string,
  recipe_id: string,
  conversation: CommentIA[]
): Promise<ResponseAI | null> => {
  try {
    const limitedConversation = conversation.slice(-10);

    const mappedConversation = limitedConversation.map((msg) => ({
      role: msg.role === "ai" ? "assistant" : "user",
      content: msg.text,
    }));
    const { data } = await axiosInterceptor.post<ResponseAI>(
      "/recipe/ask-recipe",
      {
        question,
        recipe_id,
        conversation: mappedConversation,
      }
    );

    return data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(
        err.response?.data?.error || "Error al obtener respuesta de la IA"
      );
    }
    return null;
  }
};

export async function getIngredientNutrition(ingredient: string) {
  const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
    ingredient
  )}&search_simple=1&action=process&json=1&page_size=20`;

  const { data } = await axios.get(searchUrl);

  if (!data.products || data.products.length === 0) {
    return { ingredient, found: false };
  }

  const product = data.products[0];
  const nutriments = product.nutriments;

  return {
    ingredient,
    found: true,
    energy_kcal: nutriments["energy-kcal_100g"],
    proteins: nutriments.proteins_100g,
    carbohydrates: nutriments.carbohydrates_100g,
    fat: nutriments.fat_100g,
  };
}

export async function getRecipeNutrition(ingredients: string[]) {
  const results = await Promise.all(
    ingredients.map((ing) => getIngredientNutrition(ing))
  );

  // Filtramos los que sí se encontraron
  const valid = results.filter((r) => r.found);

  // Hacemos un promedio aproximado
  const avg = (key: keyof (typeof valid)[0]) =>
    (
      valid.reduce((sum, r) => {
        const value =
          typeof r[key] === "string"
            ? parseFloat(r[key] as string)
            : (r[key] as number);
        return sum + (isNaN(value) ? 0 : value);
      }, 0) / valid.length
    ).toFixed(2);

  return {
    total_ingredients: valid.length,
    avg_calories: avg("energy_kcal"),
    avg_proteins: avg("proteins"),
    avg_carbs: avg("carbohydrates"),
    avg_fat: avg("fat"),
    details: valid,
  };
}
