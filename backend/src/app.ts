// server.ts
import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import cors from "cors";
import dotenv from "dotenv";
import { UserService } from "./services/userService";
import authRoutes from "./routes/auth.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración básica
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Configuración de CORS más estricta
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}));

// Configuración de sesión actualizada
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Cambia a true en producción con HTTPS
    httpOnly: true,
    sameSite: 'none', // Prueba con 'none' si persisten los problemas
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Inicialización de Passport
app.use(passport.initialize());
app.use(passport.session());

// Configuración de Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.GOOGLE_CALLBACK_URL!,
  passReqToCallback: true,
  scope: ['profile', 'email']
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
      
      // Marcar como usuario existente
      return done(null, {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        avatar_url: existingUser.avatar_url,
        provider: existingUser.provider,
        role: existingUser.role,
        is_business: existingUser.is_business,
        active: existingUser.active,
        subscription_status: existingUser.subscription_status,
        isExisting: true
      });
    } else {
      // Usuario nuevo
      return done(null, {
        ...googleUser,
        isExisting: false
      });
    }
  } catch (error) {
    console.error('Error in Google Strategy:', error);
    return done(error);
  }
}));

// Serialización y deserialización de usuario
passport.serializeUser((user: any, done) => {
  if (user.isExisting) {
    done(null, { 
      id: user.id,
      type: 'local',
      provider: user.provider 
    });
  } else {
    done(null, { 
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      provider: user.provider,
      type: 'google' 
    });
  }
});

passport.deserializeUser(async (data: any, done) => {
  try {
    if (data.type === 'local') {
      const userService = new UserService();
      const user = await userService.getById(data.id);
      if (!user) {
        return done(new Error('User not found'));
      }
      done(null, {
        ...user,
        isExisting: true
      });
    } else if (data.type === 'google') {
      done(null, {
        email: data.email,
        name: data.name,
        avatar_url: data.avatar_url,
        provider: data.provider,
        isExisting: false
      });
    } else {
      done(new Error('Invalid user data'), null);
    }
  } catch (error) {
    done(error, null);
  }
});

// Rutas
app.use('/auth', authRoutes);

// Middleware de manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Internal Server Error' 
  });
});

// Ruta de prueba
app.get('/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'API funcionando correctamente',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Google Callback URL: ${process.env.GOOGLE_CALLBACK_URL}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
});

export default app;