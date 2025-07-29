// controllers/authController.ts
import { UserService } from "../services/userService";
import { Request, Response } from "express";

import {
  RegisterStepOneDto,
  RegisterStepTwoDto, // We will use this DTO for the request body
  BasicCreateDTO, // For the data passed to userService.create
  UserPayload,
} from "../interfaces/user.interface";

import { comparePassword, hashPassword } from "../utils/hash";
import {
  createToken,
  verifyTempToken,
  createTempToken,
  TokenPayload,
} from "../utils/jwt";


export class AuthController {
  constructor(private userService: UserService) {}

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const user = await this.userService.getByEmail(email);

      if (!user) {
        return res.status(401).json({ success: false, message: "Credenciales incorrectas" });
      }

      const passwordMatch = await comparePassword(password, user.password_hash);

      if (!passwordMatch) {
        return res.status(401).json({success: false, message: "Credenciales incorrectas" });
      }

      const userPayload = { 
        id: user.id, 
        name: user.name,
        email: user.email,
        role: user.role,
        provider: user.provider,
        isBusiness: user.is_business,
        active: user.active,
        subscription_status: user.subscription_status,
        avatar_url: user.avatar_url ?? null,
      };

      const token = createToken(userPayload);

      return res.status(200).json({
        success: true,
        message: "Login exitoso",
        token,
        user: userPayload,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Error interno del servidor" });
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
      const tempToken = createTempToken({
        email,
        password_hash: hashedPassword,
        step: "incomplete_registration",
        provider: "local",
      });

      return res.status(200).json({
        message: "Primer paso completado",
        temp_token: tempToken,
        next_step: "/complete-profile",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async completeProfile(req: Request, res: Response) {
    // RegisterStepTwoDto now covers `name`, `foodPreferences`, `communityPreferences`
    const { name, foodPreferences, communityPreferences }: RegisterStepTwoDto = req.body;
    const tempToken = req.headers.authorization?.replace("Bearer ", "");

    try {
      if (!tempToken) {
        return res.status(401).json({ message: "Token temporal no proporcionado" });
      }

      const tempData = verifyTempToken(tempToken);

      // Validate the 'step' from the temporary token
      if (
        tempData.step !== "incomplete_registration" &&
        tempData.step !== "incomplete_oauth_registration"
      ) {
        return res.status(401).json({ message: "Token temporal no válido para completar perfil" });
      }

      // Construct data for userService.create using BasicCreateDTO
      const userDataToCreate: BasicCreateDTO = {
        email: tempData.email,
        name: tempData.name || name, 
        password_hash: tempData.password_hash || "", 
        avatar_url: tempData.avatar_url, // For OAuth users
        provider: 'local', // Use provider from temp data, default to 'local'
        foodPreferences,
        communityPreferences,
      };

      const user = await this.userService.create(userDataToCreate);

      const userPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        provider: user.provider || 'local',
        isBusiness: user.is_business || false,
        active: user.active,
        subscription_status: user.subscription_status,
        avatar_url: user.avatar_url ?? null,
      };

      const token = createToken(userPayload);

      return res.status(201).json({ // Use 201 Created for a new resource
        message: "Perfil completado exitosamente",
        token,
        user: userPayload,
      });
    } catch (error) {
      console.error("Error al completar perfil:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async googleAuth(req: Request, res: Response) {
  try {
    const userData = req.user as any;
    
    if (!userData) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=auth_failed`
      );
    }

    // Verificar si es un usuario existente
    const isExistingUser = userData.isExisting === true;

    if (isExistingUser) {
      // Usuario existente en la DB
      const userPayload = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role || "user",
        provider: userData.provider || "google",
        isBusiness: userData.is_business || false,
        active: userData.active,
        subscription_status: userData.subscription_status,
        avatar_url: userData.avatar_url,
      };

      const token = createToken(userPayload);

      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/success?token=${token}&existing=true`
      );
    } else {
      // Usuario nuevo, redirigir para completar perfil
      const tempToken = createTempToken({
        email: userData.email,
        name: userData.name,
        avatar_url: userData.avatar_url,
        provider: "google",
        step: "incomplete_oauth_registration",
      });

      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/complete-profile?temp_token=${tempToken}&provider=google`
      );
    }
  } catch (error) {
    console.error("Error in googleAuth:", error);
    return res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=auth_failed`
    );
  }
}
}