// routes/auth.routes.ts
import { Router } from "express";
import passport from "passport";
import { AuthController } from "../controllers/authController";
import { UserService } from "../services/userService";

import {
  createTempToken,
  createToken,
  verifyTempToken,
  verifyToken,
  TempTokenPayload,
  TokenPayload 
} from "../utils/jwt";

const router = Router();
const userService = new UserService();
const authController = new AuthController(userService);

// Existing Routes
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
    session: false
  }),
  // Middleware intermedio para manejar la redirección y el token temporal
  (req, res, next) => {
    const user = req.user as any;
    console.log("✅ Usuario recibido después de Google Strategy:", user); // Para depuración

    if (user && !user.isExisting) {
        // Si es un usuario nuevo (no existente), creamos un token temporal
        const tempTokenPayload: TempTokenPayload = {
            email: user.email,
            name: user.name,
            avatar_url: user.avatar_url,
            provider: user.provider,
            step: 'incomplete_oauth_registration'
        };
        const tempToken = createTempToken(tempTokenPayload);

        return res.redirect(`${process.env.FRONTEND_URL}/onboarding?tempToken=${tempToken}`);
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
            avatar_url: user.avatar_url,
        };
        const mainToken = createToken(tokenPayload);

        return res.redirect(`${process.env.FRONTEND_URL}/set-cookie-and-redirect?token=${mainToken}`);
    } else {
        // Manejo de error si no se recibió usuario
        console.log("⚠️ No se recibió usuario en req.user");
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);


router.post("/login", authController.login.bind(authController));

router.post("/register", authController.register.bind(authController));

router.post(
  "/complete-profile",
  authController.completeProfile.bind(authController) // El controlador debe manejar la lógica del token temporal
);

router.get("/set-cookie-and-redirect", (req, res) => {
    const token = req.query.token as string;
    if (!token) {
        return res.status(401).json({ message: "Token no proporcionado" });
    }

    res.cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000, // 1h
    });

    // Redirigir al dashboard o página principal una vez que la cookie esté configurada
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
});


// Logout Route
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Error al cerrar sesión" });
    }
    res.status(200).json({ message: "Sesión cerrada exitosamente" });
  });
});

export default router;