import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ask, getById } from "@/services/chat.api.ts";
import type {
  ChatSession,
  Ingredient,
} from "@/interface/global";

// useChat (GET)
//==============================================
export const useChat = (chat_id: string | undefined) => {
  return useQuery({
    queryKey: ["chat", chat_id],
    queryFn: async () => {
      if (!chat_id) {
        return {} as ChatSession;
      }

      try {
        const response = await getById(String(chat_id));

        if (!response.success || !response.data) {
          throw new Error("Error en la respuesta del post");
        }

        console.log("Chat Data", response.data);

        return response.data as ChatSession;
      } catch (e: any) {
        if (e.response.status === 404) {
          return {} as ChatSession;
        }
        throw e;
      }
    },
    enabled: !!chat_id,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
};

// useCreateMessage (POST)
//==============================================
export const useCreateMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chat_id,
      message,
      ingredients
    }: {
      chat_id: string | null;
      message: string;
      ingredients: Ingredient[];
    }) => {
      const response = await ask(message, chat_id, ingredients);

      if (!response.success || !response.data) {
        throw new Error("Error en la respuesta del servidor");
      }

      console.log("Mensaje enviado", JSON.stringify(response.data, null, 2));

      return response;
    },

    onMutate: async ({
      chat_id,
      message,
    }: {
      chat_id: string | null;
      message: string;
      ingredients: Ingredient[];
    }) => {
      await queryClient.cancelQueries({ queryKey: ["chat", chat_id] });

      const previous = queryClient.getQueryData([
        "chat",
        chat_id,
      ]) as ChatSession;

      const user = {
        role: "USER",
        text: message,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(
        ["chat", chat_id],
        (old: ChatSession | undefined) => {
          if (!old) return old;
          return {
            ...old,
            messages: [...old.messages, user],
          };
        },
      );

      return { previous, chat_id };
    },
    onSuccess: (data, variables) => {
      const response = data;
      
      const updated = response.data?.chat;
      const targetId = variables.chat_id || updated?.chat_id;

      const iaMessage = updated?.messages.findLast((m: any) => m.role === "IA");

      queryClient.setQueryData(
        ["chat", targetId],
        (old: ChatSession | undefined) => {
          if (!old) return updated;

          return {
            ...old,
            messages: [...old.messages, ...(iaMessage ? [iaMessage] : [])],
          };
        },
      );
    },

    onError: (err, { chat_id }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["chat", chat_id], context.previous);
      }
    },
  });
};