import { Request, Response } from "express";

import { ollamaConfig } from "../../../config/config";
import { RecipeService } from "../../recipe/recipe.service";

import ChatSessionService from "../services/chat-session.service";
import SessionService from "../../../services/session.service";

import axios from "axios";

export class ChatController {
  private recipeService: RecipeService;
  private readonly chatSessionService = new ChatSessionService();
  private readonly sessionService = new SessionService();

  constructor(recipeService: RecipeService) {
    this.recipeService = recipeService;
  }

  /** POST /api/chat/ask ASK OLLAMA */
  async askOllama(req: Request, res: Response) {
    const { question, type, ingredients, page, conversation, chat_id } =
      req.body;

    const user_id = (req as any).user?.id;

    try {
      const model = "llama3.2:1b";

      let messages = [
        ...(Array.isArray(conversation) ? conversation : []),
        { role: "user", content: question },
      ];

      if (type === "ask") {
        const response = await axios.post(`${ollamaConfig.host}/api/chat`, {
          model: model,
          messages,
          stream: false,
        });

        const iaResponse = response.data.message?.content || "Sin respuesta";

        let title = "";
        let finalChatId = chat_id;
        let exists = !!chat_id;

        // 2. Generar Título y nuevo ChatId si es una conversación nueva
        if (!chat_id) {
          // Generar título de forma síncrona (requerido para enviarlo en la respuesta)
          title = await this.chatSessionService.generateChatTitle(question);
          finalChatId = this.sessionService.generateUniqueId();
          exists = false;
        }

        // 3. Enviar la respuesta al cliente INMEDIATAMENTE
        res.json({
          success: true,
          title: title,
          chatId: finalChatId,
          comment: iaResponse,
        });

        // 4. Guardar el historial de conversación de forma ASÍNCRONA
        this.chatSessionService
          .addMessages(
            finalChatId,
            user_id,
            [
              {
                role: "USER",
                text: question,
              },
              {
                role: "IA",
                text: iaResponse,
              },
            ],
            title,
            exists
          )
          .catch((err) => {
            console.error(
              "Error guardando mensajes de chat de forma asíncrona:",
              err
            );
          });

        return;
      }

      if (type === "recipe" || type === "ingredient") {
        const result = await this.recipeService.ask({
          type,
          question,
          ingredients: Array.isArray(ingredients) ? ingredients : [],
          page: parseInt(page),
          limit: 20,
        });

        if (!result.data || result.data.length === 0) {
          return res.status(200).json({
            success: true,
            data: [],
            pagination: result.pagination,
          });
        }

        return res.status(200).json({
          success: true,
          data: result.data,
          pagination: result.pagination,
        });
      }

      return res.status(400).json({
        success: false,
        error: "Tipo de solicitud no válido.",
      });
    } catch (error: any) {
      if (!res.headersSent) {
        console.error("Error en askOllama:", error);
        res.status(500).json({ success: false, error: error.message });
      } else {
        console.error("Error posterior al envío de respuesta:", error);
      }
    }
  }

  /** POST /api/chat/ask-recipe ASK RECIPE */
  async askRecipe(req: Request, res: Response) {
    // puede tener un chatId si es una conversación existente
    const { question, recipe_id, conversation, chatId } = req.body;

    const user_id = (req as any).user?.id;

    try {
      if (!recipe_id || typeof question !== "string") {
        return res.status(400).json({
          success: false,
          error: "Datos inválidos (recipe_id o question).",
        });
      }

      // Determinar si es un chat existente o el primer mensaje (aunque idealmente siempre debería tener chatId aquí)
      const finalChatId = chatId || this.sessionService.generateUniqueId();
      const exists = !!chatId;

      const recipe = await this.recipeService.getRecipeById(recipe_id);
      if (!recipe) {
        return res
          .status(404)
          .json({ success: false, comment: "Receta no encontrada" });
      }

      // --- Preparación del Contexto para Ollama ---
      const recipeContext = [
        `Nombre: ${recipe.name}`,
        `Descripción: ${recipe.description || "Sin descripción"}`,
        `Ingredientes: ${(recipe.ingredients || [])
          .map(
            (ing: any) =>
              `${ing.ingredient?.name || ing.name} (${ing.quantity || ""} ${ing.unit_of_measure?.name || ""})`
          )
          .join(", ")}`,
        `Pasos: ${(recipe.steps || [])
          .map((s: any, i: number) => `${i + 1}) ${s.description}`)
          .join(" ")}`,
      ].join("\n");

      const systemMessage = `Sos un asistente de cocina de DualEat.
        REGLA CRÍTICA: Solo usá la información de la receta si el usuario pregunta EXPLÍCITAMENTE sobre ella (ingredientes, pasos, tiempos, sustituciones, etc.).
        
        Si el usuario:
        - Saluda o pregunta cosas generales (nombre, cómo estás, etc.) → Respondé brevemente SIN mencionar la receta
        - Pregunta sobre la receta → Usá la info de abajo para responder de forma concisa
        
        Receta disponible:
        ${recipeContext}`;

      const messages = [
        { role: "system", content: systemMessage },
        ...(Array.isArray(conversation) ? conversation : []),
        { role: "user", content: question },
      ];

      // --- Llamada a Ollama ---
      const ollamaResponse = await axios.post(`${ollamaConfig.host}/api/chat`, {
        model: "llama3.2:1b",
        messages,
        stream: false,
        temperature: 0.3,
      });

      const iaResponse =
        ollamaResponse.data.message?.content || "Sin respuesta";

      const title = exists ? "" : recipe.name;

      res.status(200).json({
        success: true,
        title,
        chatId: finalChatId,
        comment: iaResponse,
      });

      // 4. Guardar la sesión de forma ASÍNCRONA (Añadir el activeRecipeId)
      this.chatSessionService
        .addMessages(
          finalChatId,
          user_id,
          [
            { role: "USER", text: question },
            { role: "IA", text: iaResponse },
          ],
          title,
          exists,
          recipe.id
        )
        .catch((err) => {
          console.error(
            "Error guardando mensajes de chat de forma asíncrona:",
            err
          );
        });

      return;
    } catch (error: any) {
      if (!res.headersSent) {
        console.error("Error en askRecipe:", error);
        res.status(500).json({ success: false, error: error.message });
      } else {
        console.error(
          "Error posterior al envío de respuesta (asíncrono):",
          error
        );
      }
    }
  }

  // -------------------------------------------------------------

  /** GET /api/chat/session GET CHAT SESSION */
  async getChatSession(req: Request, res: Response) {
    const { chat_id } = req.query;
    const user_id = (req as any).user?.id;

    console.log("HOAAAAAA", user_id + "  /  " + chat_id);
    try {
      const chatSession = await this.chatSessionService.getChatDataById(
        String(user_id),
        String(chat_id)
      );
      res.status(200).json({ success: true, data: chatSession });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /** GET /api/chat/all-sessions GET USER CHATS */
  async getChatSessions(req: Request, res: Response) {
    const user_id = (req as any).user?.id;
    try {
      const chatSessions = await this.chatSessionService.getUserChats(
        String(user_id)
      );
      res.status(200).json({ success: true, data: chatSessions });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /** PUT /api/chat/edit EDIT USER TITLE */
  async editChatSession(req: Request, res: Response) {
    const { chat_id, title } = req.body;
    const user_id = (req as any).user?.id;

    try {
      const chatSession = await this.chatSessionService.editTitle(
        String(chat_id),
        String(user_id),
        String(title)
      );

      if (!chatSession) {
        return res.status(400).json({ success: false, error: "Error editando título del chat." });
      }

      res.status(200).json({ success: true, data: chatSession });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /** DELETE /api/chat/session DELETE USER CHAT */
  async deleteChatSession(req: Request, res: Response) {
    const { chat_id } = req.query;
    const user_id = (req as any).user?.id;

    try {
      if (!chat_id) {
        return res.status(400).json({
          success: false,
          error: "Datos inválidos (chatId).",
        });
      }

      const result = await this.chatSessionService.deleteChat(
        chat_id as string,
        user_id
      );

      if (result) {
        res.status(200).json({ success: true });
      } else {
        res.status(400).json({ success: false, error: "Chat no encontrado." });
      }
    } catch (error: any) {
      if (!res.headersSent) {
        console.error("Error en deleteChatSession:", error);
        res.status(500).json({ success: false, error: error.message });
      } else {
        console.error(
          "Error posterior al envío de respuesta (asíncrono):",
          error
        );
      }
    }
  }

  /** DELETE /api/chat/all-sessions DELETE ALL USER CHATS */
  async deleteAllChatSessions(req: Request, res: Response) {
    const user_id = (req as any).user?.id;
    try {
      await this.chatSessionService.deleteAllUserChats(String(user_id));
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
