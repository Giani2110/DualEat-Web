import crypto from "crypto";
import Redis from "ioredis";


export class SessionService {
  protected redis = new Redis();

  // Generar ID único
  public generateUniqueId(): string {
    return crypto.randomBytes(24).toString("hex");
  }

  // Obtener datos (El llamador debe pasar la clave completa, incluyendo el prefijo)
  async get(key: string): Promise<string | null> {
    try {
      return this.redis.get(key);
    } catch (error) {
      console.error(`❌ Error obteniendo clave ${key}:`, error);
      return null;
    }
  }

  // Guardar datos con TTL
  async set(key: string, data: string, ttlSeconds: number): Promise<void> {
    await this.redis.setex(key, ttlSeconds, data);
  }

  // Obtener TTL restante
  async getTtl(key: string): Promise<number> {
    return this.redis.ttl(key);
  }

  // Eliminar
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      console.log(`🗑️ Clave eliminada: ${key}`);
    } catch (error) {
      console.error("❌ Error eliminando clave:", error);
    }
  }

  // Obtener todas las claves con el prefijo
  async keys(pattern: string): Promise<string[]> {
    return this.redis.keys(pattern);
  }
}

export default SessionService;


