import React, { useState, useEffect } from "react";
import {
  getMe,
  login as authLogin,
  register as authRegister,
  completeProfile as authCompleteProfile,
  logout as authLogout,
} from "@/services/auth.api";
import type {
  NotificationFrequency,
  Role,
  SuscriptionStatus,
  Workplace,
} from "@interface/global";

import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export interface UserSessionData {
  id: string;
  name: string;
  email: string;
  slug: string;
  role: Role;
  provider: string;
  is_business: boolean;
  active: boolean;
  subscription_status: SuscriptionStatus;
  trial_ends_at: Date | null;
  avatar_url: string;
  verified: boolean;
  notificationsPref: NotificationFrequency;

  created_at: Date;
  updated_at: Date;

  workplaces: Workplace[];

  loginAt?: Date;
  lastActivity?: Date;
  deviceId?: string;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserSessionData | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const user = await getMe();
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  // --- 1. LOGIN (Email, Password, RememberMe, RecaptchaToken, DeviceId) ---
  // ===========================================
  const login = async (
    e: string,
    p: string,
    r: boolean,
    rt: string | null,
    d: string,
  ) => {
    setLoading(true);
    try {
      const response = await toast.promise(
        (async () => {
          const res = await authLogin(e, p, r, rt, d);
          if (!res.success) {
            throw new Error(res.message || "Error al iniciar sesión");
          }
          return res;
        })(),
        {
          loading: "Iniciando sesión...",
          success: (res) => res.message || "Inicio de sesión exitoso",
          error: (err) => err.message || "Error al iniciar sesión",
        },
      );

      if (response && response.success) {
        const user = await getMe();
        setUser(user);
      }

      return response;
    } catch (e: any) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // --- 2. REGISTER (Email, Password, DeviceId) ---
  // ===========================================
  const register = async (e: string, p: string, d: string) => {
    setLoading(true);
    try {
      const response = await toast.promise(
        (async () => {
          const res = await authRegister(e, p, d);
          if (!res.success) {
            throw new Error(res.message || "Error al registrar");
          }
          return res;
        })(),
        {
          loading: "Registrando...",
          success: (res) => res.message || "Registro exitoso",
          error: (err) => err.message || "Error al registrar",
        },
      );

      return response;
    } catch (e: any) {
      console.log(e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // --- 3. COMPLETE PROFILE (Name, FoodPreferences, CommunityPreferences, TempToken) ---
  // ===========================================
  const completeProfile = async (
    n: string,
    f: string[],
    c: string[],
    tt: string,
  ) => {
    setLoading(true);

    try {
      const response = await toast.promise(
        (async () => {
          const res = await authCompleteProfile(n, f, c, tt);
          if (!res.success) {
            throw new Error(res.message || "Error al completar el perfil");
          }
          return res;
        })(),
        {
          loading: "Completando perfil...",
          success: (res) => res.message || "Perfil completado exitosamente",
          error: (err) => err.message || "Error al completar el perfil",
        },
      );

      if (response && response.success) {
        const user = await getMe();
        setUser(user);
      }

      return response;
    } catch (e) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);

    try {
      const response = await toast.promise(
        (async () => {
          const res = await authLogout();
          if (!res.success) {
            throw new Error(res.message || "Error al cerrar sesión");
          }
          return res;
        })(),
        {
          loading: "Cerrando sesión...",
          success: (res) => res.message || "Sesión cerrada exitosamente",
          error: (err) => err.message || "Error al cerrar sesión",
        },
      );

      if (response?.success) {
        setUser(null);
      }
    } catch (e: any) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const user = await getMe();
      setUser(user);
    } catch {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    completeProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
