import express from "express";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";
import { configurePassport } from "./config/passport";
import { redisClient } from './config/redis';
import { sessionService } from "./services/session.service";

import { API_PREFIX } from "./config/config";

// Routes
import authRoutes from "./routes/auth.routes";
import onboardingRoutes from "./routes/onBoarding.routes";
import foodCategoriesRoutes from "./routes/onBoarding.routes";
import contactRouter from "./routes/contact.routes";
import adminRouter from "./routes/admin.routes";
import qrRoutes from "./routes/qr.routes";
import ocrRoutes from "./routes/ocr.routes";
import foodRoutes from "./routes/food.routes";

import communityRoutes from "./routes/community.routes";
import recipeRoutes from "./routes/recipe.routes";
import communityTagsRouter from "./routes/community-tag.routes"

// Inicialización de variables de entorno.
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// --- 1. CONFIGURACIÓN DE MIDDLEWARES GLOBALES ---

// Habilitar CORS para permitir peticiones desde el frontend.
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Origin",
      "Accept",
      "X-Requested-With",
    ],
  })
);

// Body parsers: para analizar el cuerpo de las peticiones JSON y URL-encoded.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser: para leer cookies del navegador.
app.use(cookieParser());


// Verificar conexión Redis al iniciar
async function initializeApp() {
  try {
    await redisClient.ping();
    console.log('✅ Redis OK - Aplicación iniciando...');
    
    // Tu configuración existente aquí...
    
  } catch (error) {
    console.error('❌ No se pudo conectar a Redis:', error);
    process.exit(1);
  }
}

// Inicializar cuando el proceso arranque
initializeApp();

// Configuración de la sesión. DEBE ir antes de passport.session.
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 horas
      secure: process.env.NODE_ENV === "production", // Usa 'true' solo en producción (HTTPS)
      httpOnly: true,
    },
  })
);

// --- 2. CONFIGURACIÓN DE PASSPORT ---

// Inicialización de la estrategia de Passport.

configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// --- 3. DEFINICIÓN DE RUTAS API ---

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/onboarding`, onboardingRoutes);
app.use(`${API_PREFIX}/food-categories`, foodCategoriesRoutes);
app.use(`${API_PREFIX}/contact`, contactRouter);
app.use(`${API_PREFIX}/community-tags`, communityTagsRouter);
app.use(`${API_PREFIX}/community`, communityRoutes);

// Recetas
app.use("/api/recipes", recipeRoutes);

//Admin
app.use("/admin", adminRouter);
app.use("/api/admin", adminRouter);

//Locales
app.use("/api/qr", qrRoutes);
app.use('/api', ocrRoutes);
app.use('/api', foodRoutes);


// --- 4. MANEJO DE RUTAS DE PRUEBA Y ERRORES ---

// Ruta de prueba para verificar el estado de autenticación.
app.get("/status", (req, res) => {
  const token = req.cookies?.accessToken;
  if (!token) return res.json({ authenticated: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return res.json({ authenticated: true, user: decoded });
  } catch (err) {
    return res.json({ authenticated: false });
  }
});

// Middleware de manejo de errores: DEBE ser el último middleware en ser definido.
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
);

// --- 5. INICIAR SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}${API_PREFIX}`);
});

export default app;
