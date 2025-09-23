import rateLimit from "express-rate-limit";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, 
  message: "Demasiadas solicitudes desde esta IP. Intenta nuevamente más tarde.",
  standardHeaders: true, // Usa headers modernos
  legacyHeaders: false,  // Desactiva headers antiguos
});

export const iaLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 30, // máximo 40 preguntas por IP
  message: "Estás enviando demasiadas preguntas a la IA. Esperá un momento antes de continuar.",
  standardHeaders: true,
  legacyHeaders: false,
});