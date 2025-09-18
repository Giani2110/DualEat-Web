import express from "express";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";

// 1. IMPORTACIONES
// =========================================================================

// Configuración y utilidades
import { configurePassport } from "./config/passport";
import { redisClient } from "./config/redis";
import { API_PREFIX } from "./config/config";

// Módulos principales y sus rutas
import authRoutes from "./modules/auth/routes/auth.routes";
import contactRouter from "./modules/mail/routes/contact.routes";
import reviewRoutes from "./modules/Locals/route/review.routes";
import critiqueRoutes from "./modules/Locals/route/critique.routes";

import statisticsRoutes from "./modules/Locals/route/statistics.routes";
import orders from "./modules/Locals/route/order.routes";
import manualLoadMenu from "./modules/Locals/route/manualLoadMenu.routes";

// Módulo de Comunidad
import communityRoutes from "./modules/community/routes/community.routes";
import communityTagsRouter from "./modules/community/routes/community-tag.routes";
import tagCategoryRouter from "./modules/community/routes/tag-category.routes";

// Módulo de Recetas y Posts
import recipeRoutes from "./modules/recipe/routes/recipe.routes";

// Rutas sin agrupar en módulos (considera agruparlas si el proyecto crece)
import onboardingRoutes from "./routes/onBoarding.routes";
import foodCategoriesRoutes from "./routes/onBoarding.routes";
import adminRouter from "./routes/admin.routes";
import qrRoutes from "./routes/qr.routes";
import ocrRoutes from "./routes/ocr.routes";
import foodRoutes from "./modules/Locals/route/food.routes";
import usersRouter from "./routes/users";

// =========================================================================

// Inicialización de variables de entorno y aplicación
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// 2. CONEXIONES Y SERVICIOS
// =========================================================================

// Verificar conexión a Redis al iniciar
async function initializeApp() {
  try {
    await redisClient.ping();
    console.log("✅ Redis OK - Aplicación iniciando...");
  } catch (error) {
    console.error("❌ No se pudo conectar a Redis:", error);
    process.exit(1);
  }
}

initializeApp();

// 3. MIDDLEWARES GLOBALES
// =========================================================================

// Configuración de CORS
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
// =========================================================================

configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// 5. DEFINICIÓN DE RUTAS API
// =========================================================================

// Rutas de Módulos (agrupadas por funcionalidad)
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/contact`, contactRouter);

// Módulo de Comunidad
app.use(`${API_PREFIX}/community`, communityRoutes);
app.use(`${API_PREFIX}/tags-categories`, tagCategoryRouter);
app.use(`${API_PREFIX}/community-tags`, communityTagsRouter);

// Módulo de Recetas y Posts
app.use(`${API_PREFIX}/recipe`, recipeRoutes);

// Módulo de Locales (si existen, aquí irían)
app.use("/api/reviews", reviewRoutes);
app.use("/api/critiques", critiqueRoutes);

// Otras rutas (considera agruparlas en módulos también)
app.use(`${API_PREFIX}/onboarding`, onboardingRoutes);
app.use(`${API_PREFIX}/food-categories`, foodCategoriesRoutes);

//Admin
app.use("/admin", adminRouter);
app.use("/api/admin", adminRouter);

//Locales
app.use('/api/users', usersRouter);
app.use("/api", qrRoutes);
app.use("/api", ocrRoutes);
app.use("/api", foodRoutes);
app.use("/api", reviewRoutes);
app.use("/api", critiqueRoutes);
app.use("/api", statisticsRoutes);
app.use("/api", orders);
app.use("/api", manualLoadMenu);

app.use("/api/qr", qrRoutes);
app.use("/api/ocr", ocrRoutes);
app.use("/api/food", foodRoutes);

// Rutas de administración
app.use("/admin", adminRouter);
app.use("/api/admin", adminRouter); // Considera si necesitas ambas, a menudo una es suficiente

// 6. RUTAS DE PRUEBA Y MANEJO DE ERRORES
// =========================================================================

// Ruta de prueba de autenticación
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

// Middleware de manejo de errores (debe ir al final)
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

// 7. INICIAR SERVIDOR
// =========================================================================

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}${API_PREFIX}`);
});

export default app;
