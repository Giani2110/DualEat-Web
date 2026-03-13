import { axiosInterceptor } from "@/api/interceptor/axios-interceptor";
import axios from "axios";

import type { ChatSessionData, PaginationInfo } from "@/interface/global";

interface ResponseAI<T = unknown> {
  success: boolean;
  comment: string;
  title?: string;
  chatId?: string;
  pagination?: PaginationInfo;
  data?: T;
}

export const getUserChats = async (): Promise<ResponseAI | null> => {
  try {
    const { data } = await axiosInterceptor.get("/chat/all-sessions");
    return data as ResponseAI;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message || "Error al obtener recetas");
    }
    return null;
  }
};

export const getChat = async (chat_id: string): Promise<ResponseAI | null> => {
  try {
    const { data } = await axiosInterceptor.get(`/chat/session`, {
        params: { chat_id },
    });
    return data as ResponseAI;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message || "Error al obtener recetas");
    }
    return null;
  }
}

export const editChat = async (chat_id: string, title: string): Promise<ResponseAI | null> => {
  try {
    const { data } = await axiosInterceptor.put(`/chat/edit`, {
        chat_id,
        title,
    });
    return data as ResponseAI;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message || "Error al obtener recetas");
    }
    return null;
  }
}


export const deleteChat = async (chat_id: string): Promise<ResponseAI | null> => {
  try {
    const { data } = await axiosInterceptor.delete(`/chat/session`, {
      params: { chat_id },
    });
    return data as ResponseAI;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.message || "Error al obtener recetas");
    }
    return null;
  }
}


export const askOllama = async (
  question: string,
  type: string,
  ingredients: number[],
  page: number,
  conversation?: ChatSessionData[],
  chat_id?: string | null
): Promise<ResponseAI | null> => {
  try {
    const limitedConversation = conversation?.slice(-30);

    const mappedConversation = limitedConversation?.map((msg) => ({
      role: msg.role === "IA" ? "assistant" : "USER",
      content: msg.text,
    }));

    const { data } = await axiosInterceptor.post("/chat/ask", {
      question,
      type,
      ingredients,
      page,
      conversation: mappedConversation,
      chat_id,
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
  conversation: ChatSessionData[],
  chat_id?: string
): Promise<ResponseAI | null> => {
  try {
    const limitedConversation = conversation.slice(-30);

    const mappedConversation = limitedConversation.map((msg) => ({
      role: msg.role === "IA" ? "assistant" : "USER",
      content: msg.text,
    }));
    const { data } = await axiosInterceptor.post(
      "/chat/ask-recipe",
      {
        question,
        recipe_id,
        conversation: mappedConversation,
        chat_id,
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


