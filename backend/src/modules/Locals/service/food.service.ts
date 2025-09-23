import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createFoodsFromOcr = async (localId: number, dishes: { name: string; price: number }[]) => {
  return await Promise.all(
    dishes.map(dish =>
      prisma.food.create({
        data: {
          local_id: localId,
          name: dish.name,
          price: dish.price,
          description: null,
          image_url: null,
          available: true
        }
      })
    )
  );
};

export const updateFood = async (foodId: number, data: { 
  name?: string; 
  price?: number; 
  description?: string; 
  image_url?: string; 
  available?: boolean; 
  category_id?: number;
  local_menu_category_id?: number;
}) => {
  return await prisma.food.update({
    where: { id: foodId },
    data
  });
};

export const deleteFood = async (foodId: number) => {
  return await prisma.food.update({
    where: {
      id: foodId,
    },
    data: {
      available: false,
    },
  });
};

export const getFoodsByLocal = async (localId: number) => {
  return await prisma.food.findMany({ where: { local_id: localId } });
};

export const getFoodById = async (foodId: number) => {
  return await prisma.food.findUnique({ where: { id: foodId } });
};