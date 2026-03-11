import { Router } from "express";
import passport from "passport";

import { AuthController } from "../controllers/auth.controller";
import { UserService } from "../services/user.service";

import { PasswordService } from "../services/password.service";
import { PasswordController } from "../controllers/password.controller";

import { generalLimiter } from "../../../middlewares/rateLimiter";
import { isAuthenticated } from "../../../middlewares/isAuthenticated";

import { createTempToken, createSecureToken } from "../../../utils/jwt";
import {
  UserSessionData,
  TempTokenPayload,
} from "../../../interfaces/user.dto";

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
  }),
  async (req, res) => {
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
      const userData: UserSessionData = {
        id: user.id,
        name: user.name,
        email: user.email,
        slug: user.slug,
        role: user.role,
        provider: user.provider,
        isBusiness: user.isBusiness,
        active: user.active,
        subscription_status: user.subscription_status,
        trial_ends_at: user.trial_ends_at,
        avatar_url: user.avatar_url,
        loginAt: new Date(),
        lastActivity: new Date(),
      };

      const accessToken = await createSecureToken(userData, true);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3 * 24 * 60 * 60 * 1000,
      });

      console.log("✅ Cookie establecida con accessToken:", res.cookie); // --- LÓGICA DE REDIRECCIÓN AÑADIDA ---

      if (user.isBusiness) {
        if (user.subscription_status === "active") {
          return res.redirect(`${process.env.FRONTEND_URL}/business/dashboard`);
        } else {
          return res.redirect(`${process.env.FRONTEND_URL}/business/menu`);
        }
      } else {
        return res.redirect(`${process.env.FRONTEND_URL}/feed`);
      } // ------------------------------------
    } else {
      console.log("⚠️ No se recibió usuario en req.user");
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=auth_failed`
      );
    }
  }
);

// Rutas de login/registro con email y contraseña
router.post(
  "/login",
  generalLimiter,
  authController.login.bind(authController)
);
router.post(
  "/register",
  generalLimiter,
  authController.register.bind(authController)
);
router.post(
  "/complete-profile",
  generalLimiter,
  authController.completeProfile.bind(authController)
);

router.post(
  "/password_reset",
  generalLimiter,
  resetController.requestReset.bind(resetController)
);
router.post(
  "/password_reset/validate-code",
  generalLimiter,
  resetController.validateCode.bind(resetController)
);
router.post(
  "/password_reset/reset",
  generalLimiter,
  resetController.reset.bind(resetController)
);

router.get("/me", isAuthenticated, (req, res) => {
  res.json(req.user);
});

router.post("/logout", authController.logout.bind(authController));

export default router;
