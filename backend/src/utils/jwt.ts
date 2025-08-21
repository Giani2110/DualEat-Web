import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { SECRET_KEY } from "../config/config";
import { Providers, Role, SubscriptionStatus, User } from "@prisma/client";

// Tipos de payload
export interface TokenPayload {
  id: number;
  name: string;
  email: string;
  role: Role;
  provider: Providers;
  isBusiness: boolean;
  active: boolean;
  subscription_status: SubscriptionStatus;
  trial_ends_at: User["trial_ends_at"];
  avatar_url: string | null;
}
export interface TempTokenPayload {
  email: string;
  password_hash?: string;
  provider?: string;
  avatar_url?: string;
  name?: string;
  step: "incomplete_registration" | "incomplete_oauth_registration";
}


// Función genérica para firmar tokens
function signToken<T extends object>(payload: T, expiresIn: string): string {
  return jwt.sign(payload, SECRET_KEY, {
    algorithm: "HS256",
    expiresIn,
  } as SignOptions);
}

// Función genérica para verificar tokens
function verifyToken<T>(token: string): T {
  return jwt.verify(token, SECRET_KEY) as T;
}

// Funciones específicas usando las genéricas
export const createToken = (payload: TokenPayload, rememberMe = false): string =>
  signToken(payload, rememberMe ? "14d" : "7d");

export const createTempToken = (payload: TempTokenPayload): string =>
  signToken(payload, "30m");


// Verificación
export const verifyTokenPayload = (token: string): TokenPayload =>
  verifyToken<TokenPayload>(token);

export const verifyTempToken = (token: string): TempTokenPayload =>
  verifyToken<TempTokenPayload>(token);

export const verifyAccessToken = (token: string): { id: number; rememberMe: boolean } =>
  verifyToken<{ id: number; rememberMe: boolean }>(token);
