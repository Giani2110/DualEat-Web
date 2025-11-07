import { useState } from "react";
import toast from "react-hot-toast";
import { askOllama, askRecipe } from "@/services/chat.api";
import type {
  Recipe,
  PaginationInfo,
  ChatSessionData,
} from "@/interface/global";

import { useChat } from "./useChat";

interface SearchParams {
  search: string;
  type: "ask" | "recipe" | "ingredient";
  includedIngredients: number[];
  page?: number;
  isLoadMore?: boolean;
  conversationHistory: ChatSessionData[];
  chat_id: string | null;
}

interface AskParams {
  search: string;
  recipeId: string;
  conversationHistory: ChatSessionData[];
  chat_id: string | null;
}

export const useRecipeSearch = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
      updateTitle,
    } = useChat();

  const searchRecipes = async ({
    search,
    type,
    includedIngredients,
    page = 1,
    isLoadMore = false,
    conversationHistory,
    chat_id,
  }: SearchParams): Promise<string | null> => {
    if (!search.trim() && type !== "ingredient") return null;

    setIsLoading(true);
    setPagination(null);
    if (!isLoadMore) setRecipes([]);

    try {
      const response = await askOllama(
        search,
        type,
        includedIngredients,
        page,
        conversationHistory,
        chat_id
      );

      if (!response?.success) {
        toast.error("No se pudo obtener una respuesta. Intenta de nuevo.");
        return null;
      }

      if (type !== "ask" && response.data) {
        setRecipes((prev) =>
          isLoadMore
            ? [...prev, ...(response.data as Recipe[])]
            : (response.data as Recipe[])
        );

        if ((response.data as Recipe[]).length === 0) {
          toast.error("No se encontraron recetas. Intenta otra.");
        }

        if (response.pagination) {
          setPagination(response.pagination as PaginationInfo);
        }
      }

      if (type !== "ask" && !response.data) {
        toast.error(
          response.comment || "Búsqueda sin resultados. Intenta otra."
        );
      }

      return response.comment || null;
    } catch (err) {
      toast.error("Error de conexión. Intenta nuevamente.");
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const askRecipeSearch = async ({
    search,
    recipeId,
    conversationHistory,
    chat_id,
  }: AskParams): Promise<string | null> => {
    if (!search.trim() || !recipeId) return null;
    setIsLoading(true);

    try {
      const response = await askRecipe(
        search,
        recipeId,
        conversationHistory,
        String(chat_id)
      );

      if (response?.success && response.comment) {
        const title = response.title;

        if (title) {
          updateTitle(response.chatId as string, title);
        }

        return response.comment || null;
      }

      toast.error("No se pudo obtener una respuesta. Intenta de nuevo.");
      return null;
      
    } catch (err) {
      toast.error("Error al consultar la receta.");
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setRecipes([]);
    setPagination(null);
  };

  return {
    recipes,
    setRecipes,
    pagination,
    setPagination,
    isLoading,
    searchRecipes,
    askRecipeSearch,
    clearSearch,
  };
};
