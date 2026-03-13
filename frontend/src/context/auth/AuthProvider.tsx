import React, { useState, useEffect } from "react";
import {
  getMe,
  login as authLogin,
  register as authRegister,
  completeProfile as authCompleteProfile,
  logout as authLogout,
} from "@services/auth.api";
import type { AuthResponse } from "@services/auth.api";
import type { User } from "@interface/global";

import { AuthContext } from "./AuthContext";
import { withMinimumDelay } from "@utils/timeUtils";
import { useNavigate } from "react-router-dom";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  //const location = useLocation();
  const navigate = useNavigate();

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
      const response = await authLogin(e, p, r, rt, d);
      if (response?.success && response.user) {
        setUser(response.user);
      }
      return response;
    } catch (e) {
      setUser(null);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // --- 2. REGISTER (Email, Password, DeviceId) ---
  // ===========================================
  const register = async (
    e: string,
    p: string,
    d: string,
  ): Promise<AuthResponse | null> => {
    setLoading(true);
    try {
      const response = await authRegister(e, p, d);
      return response;
    } catch (e) {
      console.error("Error during registration:", e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // --- 3. COMPLETE PROFILE (Name, FoodPreferences, CommunityPreferences, TempToken) ---
  // ===========================================
  const completeProfile = async (
    n: string,
    fPreferences: number[],
    cPreferences: number[],
    tt: string,
  ): Promise<AuthResponse | null> => {
    setLoading(true);

    // Define un retraso mínimo de 1.5 segundos
    const minimumDelay = new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const [responseData] = await Promise.all([
        authCompleteProfile(n, fPreferences, cPreferences, tt),
        minimumDelay,
      ]);

      if (responseData?.success && responseData.user) {
        setUser(responseData.user);
      } else {
        setUser(null);
      }

      return responseData;
    } catch (e) {
      setUser(null);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const response = await authLogout();
    if (response?.success) {
      setUser(null);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const userData = await withMinimumDelay(getMe(), 0);
        setUser(userData);
        console.log(userData);
      } catch {
        setUser(null);
        localStorage.removeItem("rememberMe");
      } finally {
        setLoading(false);
      }
    };
    if (!user) {
      fetchUser();
    }
  }, [user, navigate]);

  const value = { user, loading, login, logout, register, completeProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
