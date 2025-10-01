import { Role, SubscriptionStatus } from "@prisma/client";

export interface BasicCreateDTO {
  email: string;
  name: string;
  slug: string;
  password_hash?: string;
  avatar_url?: string | null;
  provider?: string;
  foodPreferences?: number[];
  communityPreferences?: number[];
}

export interface RegisterStepTwoDto {
  name: string;
  foodPreferences?: number[];
  communityPreferences?: number[];
}

// Tipos de payload
export interface SecureTokenPayload {
  sub: string;           // Hash del user ID
  rol: string;          // Role codificado
  ses: string;          // Session ID único
  prv: string;          // Provider codificado
  rem: boolean;         // Valor de "remember me"
  typ: "access";
  iat?: number;
  exp?: number;
}

export interface TempTokenPayload {
  email: string;
  password_hash?: string;   
  provider?: string;
  avatar_url?: string;
  name?: string;
  step: 'incomplete_registration' | 'incomplete_oauth_registration';
}

// Datos completos del usuario (guardados en Redis)
export interface UserSessionData {
  id: string;
  name: string;
  email: string;
  slug: string;
  role: Role;
  provider: string;
  isBusiness: boolean;
  active: boolean;
  subscription_status: SubscriptionStatus;
  trial_ends_at: Date | null;
  avatar_url: string | null;
  loginAt: Date;
  lastActivity: Date;
}

