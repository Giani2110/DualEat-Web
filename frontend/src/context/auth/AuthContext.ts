import { createContext } from "react";
import type { User, AuthResponse } from "../../services/authService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
    rememberMe: boolean,
    recaptchaToken: string | null
  ) => Promise<User | null>;
  logout: () => void;
  register: (email: string, password: string) => Promise<AuthResponse | null>;
  completeProfile: (
    name: string,
    foodPreferences: number[],
    communityPreferences: number[],
    tempToken: string
  ) => Promise<AuthResponse | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
