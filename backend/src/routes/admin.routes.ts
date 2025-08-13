import { Router } from 'express';
import { handleCreateBusinessUserAndLocal } from '../controllers/admin.controller';
import {
  handleGetAllFoodCategories,
  handleCreateFoodCategory,
  handleUpdateFoodCategory,
  handleDeleteFoodCategory,
} from '../controllers/foodCategory.controller';

const adminRouter = Router();

// Rutas para Negocios
adminRouter.post('/business', handleCreateBusinessUserAndLocal);

// Rutas para Categorías de Comida
adminRouter.get('/food-categories', handleGetAllFoodCategories);
adminRouter.post('/food-categories', handleCreateFoodCategory);
adminRouter.put('/food-categories/:id', handleUpdateFoodCategory);
adminRouter.delete('/food-categories/:id', handleDeleteFoodCategory);

export default adminRouter;