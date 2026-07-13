import { createContext } from "react";
import type { AuthResponse } from "@interface/global";
import type { UserSessionData } from "./AuthProvider";

export interface AuthContextType {
  user: UserSessionData | null;
  loading: boolean;
  login: (
    e: string, // email
    p: string, // password
    r: boolean, // rememberMe
    rt: string | null, // recaptchaToken
    d: string, // deviceId
  ) => Promise<AuthResponse | null>;
  logout: () => Promise<void>;
  register: (
    e: string, // email
    p: string, // password
    d: string, // deviceId
  ) => Promise<AuthResponse | null>;
  completeProfile: (
    n: string, // name
    fPreferences: string[], // foodPreferences
    cPreferences: string[], // communityPreferences
    tt: string, // tempToken
  ) => Promise<AuthResponse | null>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
