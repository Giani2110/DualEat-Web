import { VoteType } from "@prisma/client";
import { prisma } from "../../../prisma/prisma";

export class ManualLoadMenuService {
  static async createFood(localId: number, data: {
    category_id?: number;
    local_menu_category_id?: number; // Agregar este campo
    name: string;
    description?: string;
    price: number;
    discount?: boolean;
    image_url?: string;
    available?: boolean;
  }) {
    const local = await prisma.local.findUnique({
      where: { id: localId }
    });
    if (!local) {
      throw new Error("Local not found");
    }

    // Validar que solo se envíe uno de los dos tipos de categoría
    if (data.category_id && data.local_menu_category_id) {
      throw new Error("Cannot set both category_id and local_menu_category_id");
    }

    // Si se envía local_menu_category_id, verificar que pertenezca al local
    if (data.local_menu_category_id) {
      const localCategory = await prisma.localMenuCategory.findFirst({
        where: { 
          id: data.local_menu_category_id,
          local_id: localId 
        }
      });
      if (!localCategory) {
        throw new Error("Local menu category not found or doesn't belong to this local");
      }
    }

    const food = await prisma.food.create({
      data: {
        local_id: localId,
        category_id: data.category_id ?? null,
        local_menu_category_id: data.local_menu_category_id ?? null,
        name: data.name,
        description: data.description,
        price: data.price,
        discount: data.discount ?? false,
        image_url: data.image_url ?? null,
        available: data.available ?? true
      }
    });

    return food;
  }

  // Agregar método para actualizar comida
  static async updateFood(foodId: number, data: {
    category_id?: number;
    local_menu_category_id?: number;
    name?: string;
    description?: string;
    price?: number;
    discount?: boolean;
    image_url?: string;
    available?: boolean;
  }) {
    const existingFood = await prisma.food.findUnique({
      where: { id: foodId }
    });
    if (!existingFood) {
      throw new Error("Food not found");
    }

    // Validar que solo se envíe uno de los dos tipos de categoría
    if (data.category_id && data.local_menu_category_id) {
      throw new Error("Cannot set both category_id and local_menu_category_id");
    }

    // Si se envía local_menu_category_id, verificar que pertenezca al local
    if (data.local_menu_category_id) {
      const localCategory = await prisma.localMenuCategory.findFirst({
        where: { 
          id: data.local_menu_category_id,
          local_id: existingFood.local_id 
        }
      });
      if (!localCategory) {
        throw new Error("Local menu category not found or doesn't belong to this local");
      }
    }

    const updatedFood = await prisma.food.update({
      where: { id: foodId },
      data: {
        category_id: data.category_id !== undefined ? data.category_id : undefined,
        local_menu_category_id: data.local_menu_category_id !== undefined ? data.local_menu_category_id : undefined,
        name: data.name,
        description: data.description,
        price: data.price,
        discount: data.discount,
        image_url: data.image_url,
        available: data.available
      }
    });

    return updatedFood;
  }

  // Agregar método para creación en lote
  static async createFoodsBulk(localId: number, dishes: Array<{
    category_id?: number;
    local_menu_category_id?: number;
    name: string;
    description?: string;
    price: number;
    discount?: boolean;
    image_url?: string;
    available?: boolean;
  }>) {
    const local = await prisma.local.findUnique({
      where: { id: localId }
    });
    if (!local) {
      throw new Error("Local not found");
    }

    // Validar todas las categorías locales antes de crear
    const localCategoryIds = dishes
      .filter(dish => dish.local_menu_category_id)
      .map(dish => dish.local_menu_category_id!);
      
    if (localCategoryIds.length > 0) {
      const validCategories = await prisma.localMenuCategory.findMany({
        where: { 
          id: { in: localCategoryIds },
          local_id: localId 
        }
      });
      
      if (validCategories.length !== localCategoryIds.length) {
        throw new Error("Some local menu categories don't belong to this local");
      }
    }

    const foods = await prisma.$transaction(
      dishes.map(dish => 
        prisma.food.create({
          data: {
            local_id: localId,
            category_id: dish.category_id ?? null,
            local_menu_category_id: dish.local_menu_category_id ?? null,
            name: dish.name,
            description: dish.description,
            price: dish.price,
            discount: dish.discount ?? false,
            image_url: dish.image_url ?? null,
            available: dish.available ?? true
          }
        })
      )
    );

    return foods;
  }

  static async getFoodsByLocalWithVotes(localId: number) {
    const foods = await prisma.food.findMany({ 
      where: { local_id: localId },
      include: {
        votes: true
      }
    });

    return foods.map(food => {
      // Importar VoteType desde @prisma/client y usar el enum correcto
      const upVotes = food.votes.filter(vote => vote.vote_type === VoteType.up).length;
      const downVotes = food.votes.filter(vote => vote.vote_type === VoteType.down).length;
      
      return {
        ...food,
        votes_up: upVotes,
        votes_down: downVotes,
        votes: undefined
      };
    });
  }
}