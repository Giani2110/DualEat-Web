import { UserService } from "../services/userService";
import { Request, Response } from "express";
import { RECAPTCHA_SECRET_KEY, SECRET_KEY } from "../config/config";

import jwt from "jsonwebtoken";
import axios from "axios";

import {
  RegisterStepTwoDto,
  BasicCreateDTO,
  UserSessionData,
  TempTokenPayload,
  SecureTokenPayload,
} from "../interfaces//user.dto";

import { comparePassword, hashPassword } from "../utils/hash";

import {
  createSecureToken,
  createTempToken,
  verifyTempToken,
} from "../utils/jwt";
import { sessionService } from "../services/session.service";

export class AuthController {
  constructor(private userService: UserService) {}

  async login(req: Request, res: Response) {
    const { email, password, rememberMe, recaptchaToken } = req.body;

    try {
      // ===== reCAPTCHA (igual que antes) =====
      if (!recaptchaToken) {
        return res.status(400).json({
          success: false,
          message: "reCAPTCHA no proporcionado",
        });
      }

      const recaptchaResponse = await axios.post(
        "https://www.google.com/recaptcha/api/siteverify",
        null,
        {
          params: {
            secret: RECAPTCHA_SECRET_KEY,
            response: recaptchaToken,
          },
        }
      );

      if (!recaptchaResponse.data.success) {
        return res.status(403).json({
          success: false,
          message: "Fallo en la verificación reCAPTCHA. Inténtalo de nuevo.",
        });
      }

      // ===== VERIFICACIÓN DE CREDENCIALES =====
      const user = await this.userService.getByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Credenciales incorrectas",
        });
      }

      const passwordMatch = await comparePassword(
        password,
        user.password_hash || ""
      );
      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: "Credenciales incorrectas",
        });
      }

      // ===== PREPARAR DATOS PARA SESIÓN =====
      const userData: UserSessionData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        provider: user.provider,
        isBusiness: user.is_business,
        active: user.active,
        subscription_status: user.subscription_status,
        trial_ends_at: user.trial_ends_at,
        avatar_url: user.avatar_url ?? null,
        loginAt: new Date(),
        lastActivity: new Date(),
      };

      // ===== CREAR TOKEN SEGURO =====
      const accessToken = await createSecureToken(
        userData,
        rememberMe || false
      );

      // ===== CONFIGURAR COOKIE SEGURA =====
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "strict" as const,
        maxAge: rememberMe
          ? 14 * 24 * 60 * 60 * 1000 // 14 días
          : 7 * 24 * 60 * 60 * 1000, // 7 días
      };

      console.log(
        `🔐 Login exitoso para: ${email} (rememberMe: ${rememberMe})`
      );

      return res
        .cookie("accessToken", accessToken, cookieOptions)
        .status(200)
        .json({
          success: true,
          message: "Login exitoso",
          user: userData,
        });
    } catch (error) {
      console.error("❌ Login error:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }
  async register(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const existingUser = await this.userService.getByEmail(email);
      if (existingUser) {
        return res
          .status(409)
          .json({ success: false, message: "El usuario ya existe" });
      }

      // Hash the password
      const hashedPassword = await hashPassword(password);

      // Create temporary token with step 1 data
      const tempToken: string = createTempToken({
        email,
        password_hash: hashedPassword,
        step: "incomplete_registration",
        provider: "local",
      });

      return res.status(200).json({
        success: true,
        message: "Trasladando a Preferencias",
        next_step: `/onboarding?tempToken=${tempToken}`,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, message: "Error interno del servidor" });
    }
  }

  async completeProfile(req: Request, res: Response) {
    const {
      name,
      foodPreferences,
      communityPreferences,
      tempToken,
    }: RegisterStepTwoDto & { tempToken: string } = req.body;

    try {
      if (!tempToken) {
        return res
          .status(401)
          .json({ message: "Token temporal no proporcionado" });
      }

      let tempData: TempTokenPayload;
      try {
        tempData = verifyTempToken(tempToken);
      } catch (err) {
        return res
          .status(401)
          .json({ message: "Token temporal inválido o expirado" });
      }

      if (
        tempData.step !== "incomplete_registration" &&
        tempData.step !== "incomplete_oauth_registration"
      ) {
        return res.status(401).json({ message: "Token temporal no válido" });
      }

      // Crear usuario real en DB
      const userDataToCreate: BasicCreateDTO = {
        email: tempData.email,
        name,
        password_hash: tempData.password_hash || undefined,
        avatar_url:
          tempData.avatar_url ||
          "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png",
        provider: tempData.provider || "local",
        foodPreferences,
        communityPreferences,
      };

      const user = await this.userService.create(userDataToCreate);

      // Datos de sesión para Redis
      const userSessionData: UserSessionData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        provider: user.provider,
        isBusiness: user.is_business,
        active: user.active,
        subscription_status: user.subscription_status,
        trial_ends_at: user.trial_ends_at,
        avatar_url: user.avatar_url ?? null,
        loginAt: new Date(),
        lastActivity: new Date(),
      };

      const accessToken = await createSecureToken(userSessionData, false);

      return res
        .cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .status(201)
        .json({
          success: true,
          message: "Perfil completado exitosamente",
          user: userSessionData,
        });
    } catch (error) {
      console.error("Error al completar perfil:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      // Obtener el token de la cookie
      const token = req.cookies.accessToken;

      if (token) {
        try {
          // Decodificar el JWT para obtener el sessionId
          const decoded = jwt.verify(token, SECRET_KEY) as SecureTokenPayload;
          const sessionId = decoded.ses;

          // Eliminar sesión de Redis
          if (sessionId) {
            await sessionService.deleteSession(sessionId);
            console.log(`🗑️ Sesión eliminada en logout: ${sessionId}`);
          }
        } catch (jwtError) {
          // Si el JWT es inválido, no importa, solo limpiamos la cookie
          console.log("Token inválido en logout, solo limpiando cookie");
        }
      }

      // Limpiar cookie
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      return res.status(200).json({
        success: true,
        message: "Sesión cerrada exitosamente",
      });
    } catch (error) {
      console.error("❌ Error en logout:", error);

      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      return res.status(200).json({
        success: true,
        message: "Sesión cerrada",
      });
    }
  }
}
