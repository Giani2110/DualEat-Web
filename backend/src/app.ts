import express from "express";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";

// 1. IMPORTACIONES
import {
  Auth,
  Contact,
  Review,
  Critique,
  Statistics,
  Orders,
  ManualLoadMenu,
  QR,
  Food,
  LocalMenuCategory,
  LocalSettings,
  LocalCalendar,
  Community,
  CommunityTags,
  TagCategory,
  Recipe,
  Post,
  Chat,
  Notification,
  Vote,
  Onboarding,
  Admin,
  OCR,
  Users,
} from "./index"

// Configuración y utilidades
import { configurePassport } from "./config/passport";
import { redisClient } from "./config/redis";
import { API_PREFIX } from "./config/config";
import { initializeSocket } from "./config/socket.config";
import { CleanupJob } from "./jobs/cleanup.job";

// Inicialización de variables de entorno y aplicación
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// 2.1. CREACIÓN DEL SERVIDOR HTTP (Requerido por Socket.io)
const httpServer = http.createServer(app);

// 2.2. CONEXIONES Y SERVICIOS

// Verificar conexión a Redis al iniciar
async function initializeApp() {
  try {
    await redisClient.ping();
    console.log("✅ Redis OK - Aplicación iniciando...");
    initializeSocket(httpServer);
  } catch (error) {
    console.error("❌ No se pudo conectar a Redis:", error);
    process.exit(1);
  }
}

initializeApp();


const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.MOBILE_URL,
];


const validOrigins = allowedOrigins.filter(
  (origin): origin is string => typeof origin === 'string'
);


// 3. MIDDLEWARES GLOBALES
// Configuración de CORS
app.use(
  cors({
    origin: validOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Origin",
      "Accept",
      "X-Requested-With",
    ],
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Configuración de sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  })
);

// 4. AUTENTICACIÓN (PASSPORT)
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// 5. DEFINICIÓN DE RUTAS API

// Rutas de Módulos 
app.use(`${API_PREFIX}/auth`, Auth);
app.use(`${API_PREFIX}/contact`, Contact);

// Módulo de Comunidad
app.use(`${API_PREFIX}/community`, Community);
app.use(`${API_PREFIX}/tags-categories`, TagCategory);
app.use(`${API_PREFIX}/community-tags`, CommunityTags);
app.use(`${API_PREFIX}/recipe`, Recipe);
app.use(`${API_PREFIX}/post`, Post);
app.use(`${API_PREFIX}/notification`, Notification);
app.use(`${API_PREFIX}/vote`, Vote);
app.use(`${API_PREFIX}/chat`, Chat);


app.use(`${API_PREFIX}/onboarding`, Onboarding);

//Admin
app.use(`${API_PREFIX}/admin`, Admin);

//Locales
app.use(`${API_PREFIX}/users`, Users);
app.use(`${API_PREFIX}`, QR);
app.use(`${API_PREFIX}`, OCR);
app.use(`${API_PREFIX}`, Food);
app.use(`${API_PREFIX}`, Review);
app.use(`${API_PREFIX}`, Critique);
app.use(`${API_PREFIX}`, Statistics);
app.use(`${API_PREFIX}`, Orders);
app.use(`${API_PREFIX}`, ManualLoadMenu);
app.use(`${API_PREFIX}/local-menu-categories`, LocalMenuCategory);
app.use(`${API_PREFIX}/settings`, LocalSettings);
app.use(`${API_PREFIX}/calendar`, LocalCalendar);


// 6. RUTAS DE PRUEBA Y MANEJO DE ERRORES
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

// Middleware de manejo de errores
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

// Tarea de limpieza
const cleanupJob = new CleanupJob();
cleanupJob.start();

// 7. INICIAR SERVIDOR
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}${API_PREFIX}`);
  console.log(`Servidor Socket.io escuchando en puerto ${PORT}`);
});

export default app;