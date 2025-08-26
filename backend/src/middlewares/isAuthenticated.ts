import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import { TokenPayload } from "../utils/jwt";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    console.warn("Acceso denegado: token no presente");
    return res.status(401).json({ message: "Token no encontrado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Error de autenticación:", err);
    return res
      .status(401)
      .clearCookie("accessToken")
      .json({ message: "Token inválido o expirado" });
  }
};