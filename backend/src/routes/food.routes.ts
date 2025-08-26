import { Router } from 'express';
import { listFoodsController, getFoodController, updateFoodController, deleteFoodController } from '../controllers/food.controller';

const router = Router();

// Listar todos los platos de un local
router.get('/local/:localId/foods', listFoodsController);

// Obtener un plato puntual
router.get('/foods/:foodId', getFoodController);

// Actualizar un plato (nombre, precio, desc, imagen, available)
router.put('/foods/:foodId', updateFoodController);

// Eliminar un plato
router.delete('/foods/:foodId', deleteFoodController);

export default router;
