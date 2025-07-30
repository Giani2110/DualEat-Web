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
} from "../utils/jwt";

const router = Router();
const userService = new UserService();
const authController = new AuthController(userService);

// Existing Routes
// 👉 Redirige a Google
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
  // Middleware intermedio para loggear datos de usuario
  (req, res, next) => {
    const user = req.user as any;
    if (user) {
      console.log("✅ Usuario recibido después de Google Strategy:");
      console.log("isExisting:", user.isExisting);
    } else {
      console.log("⚠️ No se recibió usuario en req.user");
    }
    next();
  },
  authController.googleAuth.bind(authController)
);


// 👉 Login con email/password (local)
router.post("/login", authController.login.bind(authController));

// 👉 Registro paso 1
router.post("/register", authController.register.bind(authController));

// 👉 Completar perfil (local o google)
router.post(
  "/complete-profile",
  authController.completeProfile.bind(authController)
);

// 👉 Guardar token como cookie después del login OAuth
router.post("/set-cookie", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token)
    return res.status(401).json({ message: "Token no proporcionado" });

  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 1000, // 1h
  });

  return res.status(200).json({ message: "Cookie creada correctamente" });
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
