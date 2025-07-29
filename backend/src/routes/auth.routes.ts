// routes/auth.routes.ts
import { Router } from 'express';
import passport from 'passport';
import { AuthController } from '../controllers/authController';
import { UserService } from '../services/userService';

const router = Router();
const userService = new UserService();
const authController = new AuthController(userService);

// Existing Routes
router.post('/login', (req, res) => authController.login(req, res));
router.post('/register', (req, res) => authController.register(req, res));
router.post('/complete-profile', (req, res) => authController.completeProfile(req, res)); // This handles both local and Google now

// Google Auth Routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_auth_failed`
  }),
  (req, res) => {
    // The googleAuth controller method handles the redirection logic
    authController.googleAuth(req, res);
  }
);


// Logout Route
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error al cerrar sesión' });
    }
    res.status(200).json({ message: 'Sesión cerrada exitosamente' });
  });
});

// Authentication Status Route
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: req.user
    });
  } else {
    res.json({
      authenticated: false
    });
  }
});

export default router;