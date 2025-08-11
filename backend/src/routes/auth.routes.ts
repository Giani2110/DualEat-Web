import { Router } from "express";
import passport from "passport";

import { AuthController } from "../controllers/authController";
import { UserService } from "../services/userService";
import { PasswordService} from '../services/passwordService';
import { PasswordController } from '../controllers/passwordController';

import { isAuthenticated } from "../middlewares/isAuthenticated";


import {
  createTempToken,
  createToken,
  TempTokenPayload,
  TokenPayload,
} from "../utils/jwt";

const router = Router();
const userService = new UserService();
const authController = new AuthController(userService);

const resetService = new PasswordService();
const resetController = new PasswordController(resetService);

// --- RUTAS DE AUTENTICACIÓN ---

// Ruta de inicio de autenticación con Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// 👉 Callback después de Google login
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
    // Se elimina session: false para usar el middleware de sesión
  }),
  (req, res) => {
    const user = req.user as any;
    console.log("✅ Usuario recibido después de Google Strategy:", user); // Para depuración

    if (user && !user.isExisting) {
      const tempTokenPayload: TempTokenPayload = {
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        provider: user.provider,
        step: "incomplete_oauth_registration",
      };
      const tempToken = createTempToken(tempTokenPayload);

      return res.redirect(
        `${process.env.FRONTEND_URL}/onboarding?tempToken=${tempToken}`
      );
    } else if (user && user.isExisting) {
      const tokenPayload: TokenPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        provider: user.provider,
        isBusiness: user.isBusiness,
        active: user.active,
        subscription_status: user.subscription_status,
        trial_ends_at: user.trial_ends_at,
        avatar_url: user.avatar_url,
      };
      const mainToken = createToken(tokenPayload);

      // Se establece la cookie directamente y se redirige
      res.cookie("accessToken", mainToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000, // 1 hora
      });

      return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    } else {
      console.log("⚠️ No se recibió usuario en req.user");
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=auth_failed`
      );
    }
  }
);
// Rutas de login/registro con email y contraseña
router.post("/login", authController.login.bind(authController));
router.post("/register", authController.register.bind(authController));
router.post("/complete-profile", authController.completeProfile.bind(authController));


router.post('/password_reset', resetController.requestReset.bind(resetController));
router.post('/password_reset/validate-code', resetController.validateCode.bind(resetController));
router.post('/password_reset/reset', resetController.reset.bind(resetController));


router.get("/me", isAuthenticated, (req, res) => {
  res.json(req.user); 
});

// 👉 Ruta de logout: ahora solo limpia la cookie del token
router.post("/logout", (req, res) => {
  // Limpia la cookie del JWT para cerrar la sesión
  res.clearCookie("accessToken");
  res.status(200).json({ message: "Sesión cerrada exitosamente" });
});

export default router;