import jwt, { JwtPayload } from "jsonwebtoken";
import { SECRET_KEY } from "../config/config";
import { Providers, Role, SubscriptionStatus, User } from "@prisma/client";

// Define el tipo del payload que esperás en tus tokens
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
  password_hash?: string;    // ← ahora opcional
  provider?: string;
  avatar_url?: string;
  name?: string;
  step: 'incomplete_registration' | 'incomplete_oauth_registration';
}

interface IncompleteRegistrationPayload {
  step: 'incomplete_registration';
  email: string;
  password_hash: string;
}

// 2) Payload para registro OAuth (Google, etc)
interface IncompleteOAuthRegistrationPayload {
  step: 'incomplete_oauth_registration';
  email: string;
  provider: string;
  name: string;
  avatar_url?: string;
}


export const createToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, SECRET_KEY, {
    algorithm: "HS256",
    expiresIn: "5h",
  });
};


export const createTempToken = (payload: TempTokenPayload): string => {
  return jwt.sign(payload, SECRET_KEY, {
    algorithm: "HS256",
    expiresIn: "30m",
  });
};

export const verifyTempToken = (token: string): TempTokenPayload => {
  return jwt.verify(token, SECRET_KEY) as TempTokenPayload;
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, SECRET_KEY) as TokenPayload;
};
