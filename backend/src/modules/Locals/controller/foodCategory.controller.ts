import { Request, Response } from 'express';
import {
  getAllFoodCategories,
  createFoodCategory,
  updateFoodCategory,
  deleteFoodCategory,
} from '../service/foodCategory.service';
import { TypesCategory } from '@prisma/client';
import { getLocalMenuCategories, createLocalMenuCategory, deleteLocalMenuCategory } from '../service/foodCategory.service';

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

export const handleGetLocalMenuCategories = async (req: Request, res: Response) => {
  // 1. Obtiene el ID del local de la URL
  const localId = req.params.localId;

  // 2. Valida que el ID sea un número válido
  if (typeof localId !== 'string' || !localId) {
    return res.status(400).json({ message: 'El ID del local debe ser un número válido.' });
  }

  try {
    // 3. Llama a la función del servicio para obtener los datos
    const categories = await getLocalMenuCategories(localId);

    // 4. Envía los datos como respuesta
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error al obtener las categorías del local:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener las categorías.' });
  }
};

export const handleCreateLocalMenuCategory = async (req: Request, res: Response) => {
  const { name, local_id } = req.body;
  if (!name || !local_id) {
    return res.status(400).json({ message: 'El nombre y el ID del local son obligatorios.' });
  }
  try {
    const newCategory = await createLocalMenuCategory(name, local_id);
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error al crear la categoría de menú de local:', error);
    res.status(500).json({ message: 'Error al crear la categoría de menú de local.' });
  }
};

export const handleDeleteLocalMenuCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await deleteLocalMenuCategory(Number(id));
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar la categoría:', error);
    res.status(500).json({ message: 'Error interno del servidor al eliminar la categoría.' });
  }
};