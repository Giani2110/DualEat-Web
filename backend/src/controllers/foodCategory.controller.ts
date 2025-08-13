import { Request, Response } from 'express';
import {
  getAllFoodCategories,
  createFoodCategory,
  updateFoodCategory,
  deleteFoodCategory,
} from '../services/foodCategory.service';
import { TypesCategory } from '@prisma/client';

export const handleGetAllFoodCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await getAllFoodCategories();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories.' });
  }
};

export const handleCreateFoodCategory = async (req: Request, res: Response) => {
  const { name, tipo, description, icon_url } = req.body;
  if (!name || !tipo) {
    return res.status(400).json({ message: 'Category name and tipo are required.' });
  }
  try {
    const newCategory = await createFoodCategory(name, tipo as TypesCategory, description, icon_url);
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category.' });
  }
};

export const handleUpdateFoodCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, tipo, description, icon_url } = req.body;
  if (!name || !tipo) {
    return res.status(400).json({ message: 'Category name and tipo are required.' });
  }
  try {
    const updatedCategory = await updateFoodCategory(Number(id), name, tipo as TypesCategory, description, icon_url);
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category.' });
  }
};

export const handleDeleteFoodCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await deleteFoodCategory(Number(id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category.' });
  }
};