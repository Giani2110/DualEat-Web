import express from "express";
import passport from "passport";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";

import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { UserService } from "./services/userService";
import authRoutes from "./routes/auth.routes";
import onboardingRoutes from "./routes/onBoarding.routes";
import foodCategoriesRoutes from "./routes/onBoarding.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración básica
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With']
}));

// Inicialización de Passport
app.use(passport.initialize());

// Middleware de cookies
app.use(cookieParser());

// Configuración de Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.GOOGLE_CALLBACK_URL!,
  passReqToCallback: true,
  proxy: true // Necesario si estás detrás de un proxy (como Nginx en producción)
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const userService = new UserService();

    if (!profile.emails?.[0]?.value) {
      return done(new Error('No email found in Google profile'));
    }
    
    const googleUser = {
      googleId: profile.id,
      email: profile.emails[0].value.toLowerCase(),
      name: profile.displayName,
      avatar_url: profile.photos?.[0]?.value || null,
      provider: 'google'
    };

    // Buscar usuario existente
    const existingUser = await userService.getByEmail(googleUser.email);
    
    if (existingUser) {
      // Usuario existente - actualizar avatar si es necesario
      if (googleUser.avatar_url && existingUser.avatar_url !== googleUser.avatar_url) {
        await userService.updateAvatar(existingUser.id, googleUser.avatar_url);
      }
      
      return done(null, {
        ...existingUser,
        isExisting: true,
        isBusiness: existingUser.is_business, 
      });
    } else {
      
      return done(null, {
        ...googleUser,
        isExisting: false,
        isBusiness: false, 
      });
     
    }
  } catch (error) {
    console.error('Error in Google Strategy:', error);
    return done(error);
  }
}));

// Rutas
app.use('/auth', authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/food-categories', foodCategoriesRoutes);

// Middleware de manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Internal Server Error' 
  });
});

// Ruta de prueba
app.get('/status', (req, res) => {
  const token = req.cookies?.accessToken;

  if (!token) return res.json({ authenticated: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return res.json({ authenticated: true, user: decoded });
  } catch (err) {
    return res.json({ authenticated: false });
  }
});


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export default app;
