// controllers/authController.ts
import { UserService } from "../services/userService";
import { Request, Response } from "express";

import {
  RegisterStepOneDto,
  RegisterStepTwoDto,
  BasicCreateDTO, 
  UserPayload,
} from "../interfaces/user.interface";

import { comparePassword, hashPassword } from "../utils/hash";
import {
  createToken,
  verifyTempToken,
  createTempToken,
  TokenPayload,
  TempTokenPayload, // Importar TempTokenPayload
} from "../utils/jwt";
import { Providers, Role, SubscriptionStatus } from "@prisma/client"; // Importar Providers, Role, SubscriptionStatus

export class AuthController {
  constructor(private userService: UserService) {}

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const user = await this.userService.getByEmail(email);

      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Credenciales incorrectas" });
      }

      const passwordMatch = await comparePassword(password, user.password_hash || ""); // Asegurarse de que password_hash no sea undefined

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

      const token = createToken(userPayload);

      return res.status(200).json({
        success: true,
        message: "Login exitoso",
        user: userPayload,
        token: token, // Devolver el token para que el frontend lo maneje
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
        return res.status(409).json({ message: "El usuario ya existe" });
      }

      // Hash the password
      const hashedPassword = await hashPassword(password);

      // Create temporary token with step 1 data
      const tempToken: string = createTempToken({ // Especificar tipo para claridad
        email,
        password_hash: hashedPassword,
        step: "incomplete_registration",
        provider: Providers.local, // Usar el enum Providers
      });

      return res.status(200).json({
        message: "Primer paso completado",
        temp_token: tempToken,
        next_step: "/onboarding",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async completeProfile(req: Request, res: Response) {
    // El frontend enviará el tempToken en el cuerpo de la solicitud
    const { name, foodPreferences, communityPreferences, tempToken }:
      RegisterStepTwoDto & { tempToken: string } = req.body; // Combinar DTOs para el cuerpo de la solicitud

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
        return res.status(401).json({ message: "Token temporal inválido o expirado" });
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
        name: tempData.name || name || "", // Usar nombre del token temporal si existe, o del body, o cadena vacía
        password_hash: tempData.password_hash || undefined, // Asegurarse de que sea undefined si no existe
        avatar_url: tempData.avatar_url,
        provider: tempData.provider as Providers || Providers.local, // Castear a Providers o usar 'local' por defecto
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

      const token = createToken(userPayload);

      // Devolver el token principal para que el frontend lo guarde como cookie
      return res.status(201).json({
        success: true,
        message: "Perfil completado exitosamente",
        user: userPayload,
        accessToken: token, // Enviar el token principal al frontend
      });
    } catch (error) {
      console.error("Error al completar perfil:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}
