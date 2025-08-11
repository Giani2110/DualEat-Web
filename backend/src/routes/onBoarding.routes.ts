// routes/foodCategorie.routes.ts
import { Router } from 'express';
import { getOnboardingData /*, getFoodCategories*/, getFoodCategoriesByType } from '../controllers/onBoardingController'; // O el nombre de tu archivo de controlador

const router = Router();

router.get('/', getOnboardingData); // Ahora este endpoint devuelve todo

// endpoint separado para solo categorías de comida
// router.get('/food-only', getFoodCategories); // Nueva ruta para solo categorías de comida

router.get('/type/:type', getFoodCategoriesByType);

export default router;