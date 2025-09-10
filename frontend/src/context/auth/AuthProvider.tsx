import React, { useState, useEffect } from "react";
import {
  getMe,
  login as authLogin,
  register as authRegister,
  completeProfile as authCompleteProfile,
  logout as authLogout,
} from "../../services/auth.api";
import type { AuthResponse, User } from "../../services/auth.api";

import { AuthContext } from "./AuthContext";
import { withMinimumDelay } from "../../utils/timeUtils";
import { useLocation } from "react-router-dom";


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const location = useLocation();

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean,
    recaptchaToken: string | null
  ) => {
    setLoading(true);
    try {
      const userData = await authLogin(
        email,
        password,
        rememberMe,
        recaptchaToken
      );
      if (userData) {
        setUser(userData);
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        }
      }
      return userData;
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string
  ): Promise<AuthResponse | null> => {
    setLoading(true);
    try {
      const response = await authRegister(email, password);
      return response;
    } catch (error) {
      console.error("Error during registration:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const completeProfile = async (
    name: string,
    foodPreferences: number[],
    communityPreferences: number[],
    tempToken: string
  ): Promise<AuthResponse | null> => {
    setLoading(true);

    // Define un retraso mínimo de 1.5 segundos
    const minimumDelay = new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const [responseData] = await Promise.all([
        authCompleteProfile(
          name,
          foodPreferences,
          communityPreferences,
          tempToken
        ),
        minimumDelay,
      ]);

      if (responseData?.success && responseData.user) {
        setUser(responseData.user);
      } else {
        setUser(null);
      }

      return responseData;
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const response = await authLogout();
    if (response?.success) {
      localStorage.removeItem("rememberMe");
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
    fetchUser();
  }, [location.pathname]);

  const value = { user, loading, login, logout, register, completeProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
