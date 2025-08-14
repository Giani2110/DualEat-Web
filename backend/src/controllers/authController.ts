import { UserService } from "../services/userService";
import { Request, Response } from "express";
import { RECAPTCHA_SECRET_KEY } from "../config/config";
import axios from "axios";

import {
  RegisterStepOneDto,
  RegisterStepTwoDto,
  BasicCreateDTO,
  UserPayload,
} from "../interfaces/user.interface";

import { comparePassword, hashPassword } from "../utils/hash";
import {
  verifyTempToken,
  createTempToken,
  TokenPayload,
  TempTokenPayload,
  createToken,
} from "../utils/jwt";
import { Providers, Role, SubscriptionStatus } from "@prisma/client";

export class AuthController {
  constructor(private userService: UserService) {}

  async login(req: Request, res: Response) {
    const { email, password, rememberMe, recaptchaToken } = req.body;

    try {
      if (!recaptchaToken) {
        return res
          .status(400)
          .json({ success: false, message: "reCAPTCHA no proporcionado" });
      }

      const recaptchaVerificationUrl = `https://www.google.com/recaptcha/api/siteverify`;
      const recaptchaResponse = await axios.post(
        recaptchaVerificationUrl,
        null,
        {
          params: {
            secret: RECAPTCHA_SECRET_KEY,
            response: recaptchaToken,
          },
        }
      );

      const recaptchaData = recaptchaResponse.data;

      if (!recaptchaData.success) {
        console.error(
          "reCAPTCHA verification failed:",
          recaptchaData["error-codes"]
        );
        return res
          .status(403)
          .json({
            success: false,
            message: "Fallo en la verificación reCAPTCHA. Inténtalo de nuevo.",
          });
      }

      const user = await this.userService.getByEmail(email);

      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Credenciales incorrectas" });
      }

      const passwordMatch = await comparePassword(
        password,
        user.password_hash || ""
      );

      if (!passwordMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Credenciales incorrectas" });
      }

      // Generar payload para el token principal
      const userPayload: TokenPayload = {
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
      };

      // 4. Generar tokens
      const accessToken = createToken(userPayload, rememberMe);

      return res
        .cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: rememberMe
            ? 14 * 24 * 60 * 60 * 1000
            : 7 * 24 * 60 * 60 * 1000,
        })
        .status(200)
        .json({
          success: true,
          message: "Login exitoso",
          user: userPayload,
        });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, message: "Error interno del servidor" });
    }
  }

  async register(req: Request, res: Response) {
    const { email, password }: RegisterStepOneDto = req.body;

    try {
      // Check if user already exists
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
        provider: Providers.local,
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
    // El frontend enviará el tempToken en el cuerpo de la solicitud
    const {
      name,
      foodPreferences,
      communityPreferences,
      tempToken,
    }: RegisterStepTwoDto & { tempToken: string } = req.body; // Combinar DTOs para el cuerpo de la solicitud

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

      // Validar el paso del token temporal
      if (
        tempData.step !== "incomplete_registration" &&
        tempData.step !== "incomplete_oauth_registration"
      ) {
        return res.status(401).json({ message: "Token temporal no válido" });
      }

      // Construir datos para crear el usuario
      const userDataToCreate: BasicCreateDTO = {
        email: tempData.email,
        name: name, // Usar nombre del token temporal si existe, o del body, o cadena vacía
        password_hash: tempData.password_hash || undefined, // Asegurarse de que sea undefined si no existe
        avatar_url:
          tempData.avatar_url ||
          "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/Profile.png",
        provider: (tempData.provider as Providers) || Providers.local, // Castear a Providers o usar 'local' por defecto
        foodPreferences,
        communityPreferences,
      };

      // Crear usuario
      const user = await this.userService.create(userDataToCreate);

      // Generar token principal para el nuevo usuario
      const userPayload: TokenPayload = {
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
      };

      const token = createToken(userPayload, false);

      return res
        .cookie("accessToken", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .status(201)
        .json({
          success: true,
          message: "Perfil completado exitosamente",
          user: userPayload,
        });
    } catch (error) {
      console.error("Error al completar perfil:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}
