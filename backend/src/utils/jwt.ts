import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config/config";
import {
  SecureTokenPayload,
  UserSessionData,
  TempTokenPayload,
} from "../interfaces/user.dto";

import { Role } from "@prisma/client";
import crypto from "crypto";

import { sessionService } from "../modules/auth/services/session.service";

export function createTempToken(payload: TempTokenPayload): string {
  return jwt.sign(payload, SECRET_KEY, {
    algorithm: "HS256",
    expiresIn: "30m",
    jwtid: crypto.randomUUID(),
  });
}

export function verifyTempToken(token: string): TempTokenPayload {
  return jwt.verify(token, SECRET_KEY) as TempTokenPayload;
}

// Funciones para ofuscar datos
function hashUserId(userId: number): string {
  return crypto
    .createHash("sha256")
    .update(`${userId}:${SECRET_KEY}`)
    .digest("hex")
    .substring(0, 12);
}

function encodeRole(role: Role): string {
  const roleMap: Record<Role, string> = {
    admin: "a",
    user: "u",
  };
  return roleMap[role] || "u";
}

function encodeProvider(provider: string): string {
  const providerMap: Record<string, string> = {
    google: "g",
    local: "l",
  };
  return providerMap[provider] || "l";
}

export async function createSecureToken(
  userData: UserSessionData,
  rememberMe: boolean
): Promise<string> {
  // TTL basado en rememberMe
  const ttlSeconds = rememberMe ? 3 * 24 * 60 * 60 : 24 * 60 * 60; // 3 días vs 1 día

  // Crear sesión en Redis
  const sessionId = await sessionService.createSession(userData, ttlSeconds);

  // Payload mínimo para JWT
  const payload: SecureTokenPayload = {
    sub: hashUserId(userData.id),
    rol: encodeRole(userData.role),
    prv: encodeProvider(userData.provider),
    rem: rememberMe,
    ses: sessionId,
    typ: "access",
  };

  // JWT con misma duración que la sesión
  return jwt.sign(payload, SECRET_KEY, {
    algorithm: "HS256",
    expiresIn: rememberMe ? "3d" : "1d", // 3 días vs 1 día
    jwtid: crypto.randomUUID(),
  });
}

// Verificar access token
export function verifyAccessToken(token: string): SecureTokenPayload {
  return jwt.verify(token, SECRET_KEY) as SecureTokenPayload;
}
