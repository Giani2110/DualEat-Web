import { Request, Response } from 'express';
import { createFoodsFromOcr, updateFood, deleteFood, getFoodsByLocal, getFoodById } from '../services/food.service';

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
  const foodId = parseInt(req.params.foodId);
  const food = await updateFood(foodId, req.body);
  res.json(food);
};

export const deleteFoodController = async (req: Request, res: Response) => {
  const foodId = parseInt(req.params.foodId);
  await deleteFood(foodId);
  res.json({ success: true });
};