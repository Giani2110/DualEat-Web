import { PrismaClient, TypesCategory } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener todas las categorías de comida asociadas a un local específico
export const getLocalMenuCategories = async (localId: number) => {
  return prisma.localMenuCategory.findMany({
    where: { local_id: localId },
    orderBy: { name: 'asc' },
  });
};

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

export const createLocalMenuCategory = async (name: string, localId: number) => {
  return prisma.localMenuCategory.create({
    data: {
      name,
      local_id: localId,
    },
  });
};

export const deleteLocalMenuCategory = async (id: number) => {
  return prisma.localMenuCategory.delete({
    where: { id },
  });
};