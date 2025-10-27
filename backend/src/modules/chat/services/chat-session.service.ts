import SessionService from "../../../services/session.service";
import { ollamaConfig } from "../../../config/config";

import axios from "axios";
import { createHash } from "crypto";

interface ChatSessionData {
  text: string;
  role: "USER" | "IA";
}

interface CHATData {
  chatId: string;
  title?: string;
  messages: ChatSessionData[];
  createdAt: string;
  lastUpdated: string;
  activeRecipeId?: string;
}

interface ChatMetadata {
  chatId: string;
  title: string;
  activeRecipeId?: string;
  createdAt: string;
  lastUpdated: string;
}

export class ChatSessionService {
  private readonly sessionService = new SessionService();
  private readonly SESSION_PREFIX = "chat:";

  constructor() {}


  private hashUser(userId: string): string {
    const hashed = createHash("sha256").update(userId).digest("hex");
    return hashed;
  }

  /**
   * Simula la desencriptación devolviendo el userId hasheado.
   * Como el hash es irreversible, no se puede recuperar el userId original.
   */
  public getChatKey(userId: string): string {
    return this.hashUser(userId);
  }

  /**
   * Verifica si un hash coincide con el userId dado.
   * Útil si querés validar identidad sin desencriptar.
   */
  public matchesUserHash(userId: string, hash: string): boolean {
    return this.hashUser(userId) === hash;
  }
  /**
   * Genera un título automático usando Ollama
   */
  public async generateChatTitle(firstMessage: string): Promise<string> {
    try {
      const prompt = `Genera un título corto y descriptivo (máximo 6 palabras) para una conversación que comienza con: "${firstMessage}". Responde SOLO con el título, sin comillas, sin puntos, sin explicaciones adicionales.`;

      const response = await axios.post(
        `${ollamaConfig.host}/api/chat`,
        {
          model: "llama3.2:1b",
          messages: [{ role: "user", content: prompt }],
          stream: false,
          temperature: 0.7,
        },
        { timeout: 5000 }
      );

      let title = response.data?.message?.content || "";

      title = title
        .trim()
        .replace(/^["']|["']$/g, "")
        .replace(/\.$/, "")
        .substring(0, 60);

      if (title.length < 3) {
        return this.generateFallbackTitle(firstMessage);
      }

      return title;
    } catch (error) {
      console.error("Error generando título con IA:", error);
      return this.generateFallbackTitle(firstMessage);
    }
  } /**
   * Genera un título básico si falla la IA
   */

  private generateFallbackTitle(message: string): string {
    const words = message.trim().split(/\s+/).slice(0, 6);
    let title = words.join(" ");

    if (title.length > 50) {
      title = title.substring(0, 47) + "...";
    }

    return title || "Nueva conversación";
  } /**
   * Obtener un chat específico por chatId
   * @param chatId - ID del chat específico
   * @returns Historial de mensajes o null
   */

  async getChatDataById(
    user_id: string,
    chat_id: string
  ): Promise<CHATData | null> {
    try {
      const sessionKey = `${this.SESSION_PREFIX}${this.hashUser(user_id)}/${chat_id}`;

      console.log("SessionKey",sessionKey);
      const data = await this.sessionService.get(sessionKey);

      if (!data) {
        console.log(`Chat no encontrado: ${chat_id}`);
        return null;
      }

      const chatData: CHATData = JSON.parse(data);
      return chatData;
    } catch (error) {
      console.error("Error obteniendo datos del chat:", error);
      return null;
    }
  } /**
   * Obtener todos los chats de un usuario
   * @param userId - ID del usuario
   * @returns Array de chats con metadata
   */

  async getUserChats(userId: string): Promise<ChatMetadata[] | null> {
    try {
      const encryptedUserId = this.hashUser(userId);
      const pattern = `${this.SESSION_PREFIX}${encryptedUserId}/*`;
      const keys = await this.sessionService.keys(pattern);

      const chats: ChatMetadata[] = [];

      for (const key of keys) {
        const data = await this.sessionService.get(key);
        if (data) {
          const chatData = JSON.parse(data);

          if (chatData) {
            chats.push({
              chatId: chatData.chatId,
              title: chatData.title,
              activeRecipeId: chatData.activeRecipeId,
              createdAt: chatData.createdAt,
              lastUpdated: chatData.lastUpdated,
            });
          }
        }
      } // Ordenar por última actualización (más reciente primero)

      return chats.sort(
        (a, b) =>
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );
    } catch (error) {
      console.error("Error obteniendo chats del usuario:", error);
      return [];
    }
  }

  /**
   * Crear un nuevo chat
   * @param userId - ID del usuario
   * @param message - Primer mensaje del chat
   * @param ttlSeconds - Tiempo de vida
   * @returns chatId del nuevo chat
   */

  async addMessages(
    chatId: string,
    userId: string,
    messages: ChatSessionData[],
    title?: string,
    exists: boolean = false,
    activeRecipeId?: string
  ): Promise<CHATData> {
    if (!chatId) throw new Error("El ID del chat es requerido.");
    if (!userId) throw new Error("El ID de usuario es requerido.");
    if (!messages || messages.length === 0) {
      throw new Error("Debe proporcionar al menos un mensaje.");
    }

    try {
      const encryptedUserId = this.hashUser(userId);
      const redisKey = `${this.SESSION_PREFIX}${encryptedUserId}/${chatId}`; // Si el chat ya existe, agregar los mensajes

      if (exists) {
        const data = await this.sessionService.get(redisKey);
        if (!data) throw new Error("Chat no encontrado.");

        const chatData: CHATData = JSON.parse(data); // Agregar todos los mensajes de una vez

        chatData.messages.push(...messages);
        chatData.lastUpdated = new Date().toISOString(); // Actualizar o mantener el activeRecipeId si se proporciona

        if (activeRecipeId !== undefined) {
          chatData.activeRecipeId = activeRecipeId;
          chatData.title = title || "Nueva conversación";
        }

        const ttl = await this.sessionService.getTtl(redisKey);
        
        if (ttl <= 0) {
          throw new Error("TTL del chat expirado.");
        }

        await this.sessionService.set(
          redisKey,
          JSON.stringify(chatData),
          ttl
        );
        console.log(
          `${messages.length} mensajes agregados al chat ${chatId} (Total: ${chatData.messages.length})`
        );

        return chatData;
      } else {
        const chatData: CHATData = {
          chatId,
          title,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          messages: messages,
          activeRecipeId: activeRecipeId || undefined,
        };

        const defaultTtl = 604800;
        await this.sessionService.set(
          redisKey,
          JSON.stringify(chatData),
          defaultTtl
        );

        console.log(
          `✅ Nuevo chat creado al agregar mensajes: ${chatId} - "${title || "Nueva conversación"}"`
        );

        return chatData;
      }
    } catch (error) {
      console.error("Error agregando mensajes:", error);
      if (error instanceof Error && error.message === "Chat no encontrado.") {
        throw error;
      }
      throw new Error(
        `Error al agregar mensajes: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  async deleteChat(chat_id: string, user_id: string): Promise<boolean> {
    try {
      const key = `${this.SESSION_PREFIX}${this.hashUser(user_id)}/${chat_id}`;
      const data = await this.sessionService.get(key); // Usamos 'data' para evitar re-fetch

      if (!data) {
        throw new Error("Chat no encontrado.");
      }

      // Dado que la clave ya incluye el ID de usuario cifrado, no necesitamos
      // desencriptar el contenido para verificar el permiso.

      await this.sessionService.delete(key);

      console.log(`🗑️ Chat eliminado: ${chat_id}`);
      return true;
    } catch (error) {
      console.error("Error eliminando chat:", error);
      return false;
    }
  }

  async deleteAllUserChats(user_id: string): Promise<boolean> {
    try {
      const encryptedUserId = this.hashUser(user_id);
      const pattern = `${this.SESSION_PREFIX}${encryptedUserId}/*`;
      const keys = await this.sessionService.keys(pattern);

      for (const key of keys) {
        await this.sessionService.delete(key);
      }

      console.log(`🗑️ ${keys.length} chats eliminados para usuario ${user_id}`);
      return true;
    } catch (error) {
      console.error("Error eliminando chats del usuario:", error);
      return false;
    }
  }
}

export default ChatSessionService;
