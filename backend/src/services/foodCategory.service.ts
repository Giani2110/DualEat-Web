import { PrismaClient, TypesCategory } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener todas las categorías de comida
export const getAllFoodCategories = async () => {
  return prisma.foodCategory.findMany();
};

// Crear una nueva categoría de comida
export const createFoodCategory = async (name: string, tipo: TypesCategory, description: string | null, icon_url: string | null) => {
  return prisma.foodCategory.create({
    data: { name, tipo, description, icon_url },
  });
};

// Actualizar una categoría existente
export const updateFoodCategory = async (id: number, name: string, tipo: TypesCategory, description: string | null, icon_url: string | null) => {
  return prisma.foodCategory.update({
    where: { id },
    data: { name, tipo, description, icon_url },
  });
};

// Eliminar una categoría
export const deleteFoodCategory = async (id: number) => {
  return prisma.foodCategory.delete({
    where: { id },
  });
};