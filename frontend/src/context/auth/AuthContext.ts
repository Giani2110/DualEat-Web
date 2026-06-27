import { createContext } from "react";
import type { User, AuthResponse } from "@interface/global";

export interface AuthContextType {
  user: User | null;
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
    fPreferences: number[], // foodPreferences
    cPreferences: number[], // communityPreferences
    tt: string, // tempToken
  ) => Promise<AuthResponse | null>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
