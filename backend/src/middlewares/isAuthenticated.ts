import { verifyAccessToken } from "../utils/jwt";
import AuthSessionService from "../modules/auth/services/auth-session.service";

import { Request, Response, NextFunction } from "express";

const authSessionService = new AuthSessionService();

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    console.warn("🚫 Acceso denegado: token no presente");
    return res.status(401).json({ message: "Token no encontrado" });
  }

  try {
    // 1. Verify JWT
    const payload = verifyAccessToken(token);

    // 2. Get data from Redis
    const userData = await authSessionService.getSession(payload.ses);

    if (!userData) {
      console.warn("⚠️ Sesión expirada:", payload.ses);
      return res
        .status(401)
        .clearCookie("accessToken")
        .json({ message: "Sesión expirada" });
    }

    // 3. Check if the user is still active (THIS MUST BE BEFORE RENEWAL)
    if (!userData.active) {
      await authSessionService.deleteSession(payload.ses);
      return res
        .status(401)
        .clearCookie("accessToken")
        .json({ message: "Usuario inactivo" });
    }

    // 4. ***RENEW THE SESSION AND COOKIE*** (Only if all checks pass)

    const rememberMe = payload.rem === true;

    // Set new cookie with the extended expiration
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict" as const,
      maxAge: rememberMe ? 3 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    };

    // Set the new cookie on the response
    res.cookie("accessToken", token, cookieOptions);

    req.user = userData;

    next();
  } catch (err) {
    console.error("❌ Error de autenticación:", err);
    return res
      .status(401)
      .clearCookie("accessToken")
      .redirect(`${process.env.FRONTEND_URL}/login`);
  }
};
