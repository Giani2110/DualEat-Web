import { axiosInterceptor } from "../interceptor/axios-interceptor";

import type { Response, PaginationInfo } from "../interface/global";

import axios from "axios";

interface ResponseAI<T = unknown> {
  success: boolean;
  comment: string;
  pagination?: PaginationInfo;
  data?: T;
}

interface Comment {
  text: string;
  role: "user" | "ai";
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
  conversation: Comment[]
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
  conversation: Comment[]
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
