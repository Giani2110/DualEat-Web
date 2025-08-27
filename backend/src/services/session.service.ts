import crypto from 'crypto';
import Redis from 'ioredis';
import { UserSessionData } from '../interfaces/user.dto';

import { redisClient } from '../config/redis';

export class SessionService {
  private redis: Redis;

  constructor(redisClient: Redis) {
    this.redis = redisClient;
  }

  // Generar session ID único
  private generateSessionId(): string {
    return crypto.randomBytes(24).toString('hex');
  }

  // Crear nueva sesión y devolver session ID
  async createSession(userData: Omit<UserSessionData, 'loginAt' | 'lastActivity'>, ttlSeconds: number): Promise<string> {
    const sessionId = this.generateSessionId();
    
    const sessionData: UserSessionData = {
      ...userData,
      loginAt: new Date(),
      lastActivity: new Date()
    };

    const key = `session:${sessionId}`;
    await this.redis.setex(key, ttlSeconds, JSON.stringify(sessionData));
    
    console.log(`📝 Sesión creada: ${sessionId} (TTL: ${ttlSeconds}s)`);
    return sessionId;
  }

  // Obtener datos de sesión
  async getSession(sessionId: string): Promise<UserSessionData | null> {
    try {
      const key = `session:${sessionId}`;
      const data = await this.redis.get(key);
      
      if (!data) {
        return null;
      }

      const sessionData: UserSessionData = JSON.parse(data);
      
      // Actualizar última actividad
      sessionData.lastActivity = new Date();
      const ttl = await this.redis.ttl(key);
      if (ttl > 0) {
        await this.redis.setex(key, ttl, JSON.stringify(sessionData));
      }
      
      return sessionData;
    } catch (error) {
      console.error('❌ Error obteniendo sesión:', error);
      return null;
    }
  }

  // Eliminar sesión
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const key = `session:${sessionId}`;
      await this.redis.del(key);
      console.log(`🗑️ Sesión eliminada: ${sessionId}`);
    } catch (error) {
      console.error('❌ Error eliminando sesión:', error);
    }
  }

  // Renovar TTL de sesión (para rememberMe)
  async refreshSession(sessionId: string, ttlSeconds: number): Promise<boolean> {
    try {
      const key = `session:${sessionId}`;
      const data = await this.redis.get(key);
      
      if (data) {
        await this.redis.setex(key, ttlSeconds, data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error renovando sesión:', error);
      return false;
    }
  }

  // Eliminar todas las sesiones de un usuario (logout all)
  async deleteAllUserSessions(userId: number): Promise<void> {
    try {
      const pattern = 'session:*';
      const keys = await this.redis.keys(pattern);
      
      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const sessionData: UserSessionData = JSON.parse(data);
          if (sessionData.id === userId) {
            await this.redis.del(key);
          }
        }
      }
      console.log(`🗑️ Todas las sesiones del usuario ${userId} eliminadas`);
    } catch (error) {
      console.error('❌ Error eliminando sesiones del usuario:', error);
    }
  }
}

// Instancia del servicio
export const sessionService = new SessionService(redisClient);