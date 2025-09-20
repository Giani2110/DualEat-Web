import { Router } from 'express';
import { 
    handleGetLocalMenuCategories, 
    handleCreateLocalMenuCategory,
    handleDeleteLocalMenuCategory
 } from '../controller/foodCategory.controller';

const localMenuCategoryRouter = Router();

// Ruta GET para obtener las categorías de un local
localMenuCategoryRouter.get('/local/:localId', handleGetLocalMenuCategories);

// Nueva ruta POST para crear una categoría de menú para un local
localMenuCategoryRouter.post('/', handleCreateLocalMenuCategory);

localMenuCategoryRouter.delete('/:id', handleDeleteLocalMenuCategory);

export default localMenuCategoryRouter;