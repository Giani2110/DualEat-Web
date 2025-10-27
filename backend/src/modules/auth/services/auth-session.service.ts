import { UserSessionData } from "../../../interfaces/user.dto";

import SessionService from "../../../services/session.service";

export class AuthSessionService {
  private readonly SESSION_PREFIX = "session:";
  private readonly sessionService = new SessionService();

  constructor() {}

  // Crear nueva sesión y devolver session ID
  async createSession(
    userData: Omit<UserSessionData, "loginAt" | "lastActivity">,
    ttlSeconds: number
  ): Promise<string> {
    try {
      const sessionId = this.sessionService.generateUniqueId();

      const sessionData: UserSessionData = {
        ...userData,
        loginAt: new Date(),
        lastActivity: new Date(),
      };
      const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
      await this.sessionService.set(
        sessionKey,
        JSON.stringify(sessionData),
        ttlSeconds
      );
      console.log(`📝 Sesión creada: ${sessionId} (TTL: ${ttlSeconds}s)`);
      return sessionId;
    } catch (error) {
      console.error("❌ Error creando sesión:", error);
      throw error;
    }
  }

  // Obtener datos de sesión
  async getSession(sessionId: string): Promise<UserSessionData | null> {
    try {
      const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
      const data = await this.sessionService.get(sessionKey);

      if (!data) {
        return null;
      }

      const sessionData: UserSessionData = JSON.parse(data);

      // Actualizar última actividad
      sessionData.lastActivity = new Date();
      const ttl = await this.sessionService.getTtl(sessionKey);
      if (ttl > 0) {
        await this.sessionService.set(
          sessionKey,
          JSON.stringify(sessionData),
          ttl
        );
      }

      return sessionData;
    } catch (error) {
      console.error("❌ Error obteniendo sesión:", error);
      return null;
    }
  }

  // Eliminar sesión
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
      await this.sessionService.delete(sessionKey);
      console.log(`🗑️ Sesión eliminada: ${sessionId}`);
    } catch (error) {
      console.error("❌ Error eliminando sesión:", error);
    }
  }

  // Eliminar todas las sesiones de un usuario (logout all)
  async deleteAllUserSessions(userId: string): Promise<void> {
    try {
      const pattern = `${this.SESSION_PREFIX}*`;
      const keys = await this.sessionService.keys(pattern);

      for (const key of keys) {
        const data = await this.sessionService.get(key);
        if (data) {
          const sessionData: UserSessionData = JSON.parse(data);
          if (sessionData.id === userId) {
            await this.sessionService.delete(key);
          }
        }
      }
      console.log(`🗑️ Todas las sesiones del usuario ${userId} eliminadas`);
    } catch (error) {
      console.error("❌ Error eliminando sesiones del usuario:", error);
    }
  }
}

export default AuthSessionService;
