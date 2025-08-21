import { Router } from 'express';
import { handleCreateBusinessUserAndLocal } from '../controllers/admin.controller';
import {
  handleGetAllFoodCategories,
  handleCreateFoodCategory,
  handleUpdateFoodCategory,
  handleDeleteFoodCategory,
} from '../controllers/foodCategory.controller';
import {
  handleGetLocals,
  handleGetLocalById,
  handleUpdateLocal,
  handleDeleteLocal,
} from '../controllers/local.controller';

const adminRouter = Router();

// Rutas para Negocios
adminRouter.post('/business', handleCreateBusinessUserAndLocal);

// Rutas para Categorías de Comida
adminRouter.get('/food-categories', handleGetAllFoodCategories);
adminRouter.post('/food-categories', handleCreateFoodCategory);
adminRouter.put('/food-categories/:id', handleUpdateFoodCategory);
adminRouter.delete('/food-categories/:id', handleDeleteFoodCategory);

// Rutas para Locales
adminRouter.get('/locals', handleGetLocals);
adminRouter.get('/locals/:id', handleGetLocalById);
adminRouter.put('/locals/:id', handleUpdateLocal);
adminRouter.delete('/locals/:id', handleDeleteLocal);

export default adminRouter;