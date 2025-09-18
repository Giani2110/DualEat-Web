import { Request, Response } from 'express';
import { createFoodsFromOcr, updateFood, deleteFood, getFoodsByLocal, getFoodById } from '../service/food.service';

export const listFoodsController = async (req: Request, res: Response) => {
  const localId = parseInt(req.params.localId);
  const foods = await getFoodsByLocal(localId);
  res.json(foods);
};

export const getFoodController = async (req: Request, res: Response) => {
  const foodId = parseInt(req.params.foodId);
  const food = await getFoodById(foodId);
  if (!food) return res.status(404).json({ error: 'Plato no encontrado' });
  res.json(food);
};

export const updateFoodController = async (req: Request, res: Response) => {
  try {
    const foodId = parseInt(req.params.foodId);
    const dataToUpdate = req.body;

    // Convertir el category_id a número si existe
    if (dataToUpdate.category_id) {
      dataToUpdate.category_id = parseInt(dataToUpdate.category_id);
    }

    // Convertir el price a número si existe
    if (dataToUpdate.price) {
      dataToUpdate.price = parseFloat(dataToUpdate.price);
    }
    
    console.log('Datos recibidos después de parsear:', dataToUpdate);

    const updatedFood = await updateFood(foodId, dataToUpdate);
    return res.json(updatedFood);
  } catch (error) {
    console.error('Error al actualizar el plato:', error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteFoodController = async (req: Request, res: Response) => {
  const foodId = parseInt(req.params.foodId);
  await deleteFood(foodId);
  res.json({ success: true });
};