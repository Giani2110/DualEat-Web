import { prisma } from "../../../prisma/prisma";

import { AskAI, PaginatedResponse } from "../../../interfaces/recipe.dto";

export class RecipeService {
  constructor() {}

  /** GET INGREDIENTS */
  async getAllIngredients() {
    try {
      const result = await prisma.ingredient.findMany();
      return result;
    } catch (error) {
      throw new Error(`Error al obtener ingredientes: ${error}`);
    }
  }

  /** GET UNITS */
  async getAllUnits() {
    try {
      const result = await prisma.unitOfMeasure.findMany({
        orderBy: { name: "asc" },
      });
      return result;
    } catch (error) {
      throw new Error(`Error al obtener unidades: ${error}`);
    }
  }

  /** GET RECIPE BY NAME (Validation) */
  async getRecipeValidation(name: string, userId: number, communityId: number) {
    try {
      const result = await prisma.recipe.findFirst({
        where: {
          user_id: userId,
          name: {
            equals: name,
            mode: "insensitive",
          },
          posts: {
            some: {
              community_id: communityId,
            },
          },
        },
      });
      return result;
    } catch (error) {
      throw new Error(`Error al obtener receta: ${error}`);
    }
  }

  /** GET RECIPE BY ID */
  async getRecipeById(id: number) {
    try {
      const result = await prisma.recipe.findUnique({
        where: { id },
        include: {
          ingredients: {
            include: {
              unit_of_measure: true,
              ingredient: true,
            },
          },
          steps: true,
        },
      });
      return result;
    } catch (error) {
      throw new Error(`Error al obtener receta: ${error}`);
    }
  }

  /** GET USER RECIPES */
  async getUserRecipes(user_id: number) {
    try {
      const result = await prisma.recipe.findMany({
        where: { user_id },
        include: {
          ingredients: {
            include: {
              unit_of_measure: true,
              ingredient: true,
            },
          },
          steps: true,
        },
      });
      return result;
    } catch (error) {
      throw new Error(`Error al obtener recetas: ${error}`);
    }
  }

  /** ASK OLLAMA */
  async ask(data: AskAI): Promise<PaginatedResponse<any>> {
    const page = data.page || 1;
    const limit = data.limit || 20;
    const skip = (page - 1) * limit;

    if (data.type === "recipe") {
      // Contar total de resultados
      const total = await prisma.recipe.count({
        where: {
          name: {
            contains: data.question,
            mode: "insensitive",
          },
        },
      });

      // Obtener resultados paginados
      const result = await prisma.recipe.findMany({
        where: {
          name: {
            contains: data.question,
            mode: "insensitive",
          },
        },
        include: {
          ingredients: true,
          steps: true,
          posts: {
            select: {
              votes_up: true,
            },
            orderBy: {
              votes_up: "desc",
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          posts: {
            _count: "desc",
          },
        },
      });

      return {
        data: result,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    }

    if (data.type === "ingredient") {
      // Contar total de resultados
      const total = await prisma.recipe.count({
        where: {
          ingredients: {
            some: {
              ingredient: {
                id: { in: data.ingredients },
              },
            },
          },
        },
      });

      // Obtener resultados paginados
      const result = await prisma.recipe.findMany({
        where: {
          ingredients: {
            some: {
              ingredient: {
                id: { in: data.ingredients },
              },
            },
          },
        },
        include: {
          ingredients: true,
          steps: true,
        },
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
      });

      return {
        data: result,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    }

    return {
      data: [],
      pagination: {
        page: 1,
        limit,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
}

/*

    async createRecipe(userId: number, name: string, description?: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("Usuario no existe");
      
        return prisma.recipe.create({
          data: { user_id: userId, name, description },
        });
    }

  async addIngredient(recipeId: number, ingredientId: number, quantity: number, unitId: number, notes?: string) {
    return prisma.recipeIngredient.create({
      data: {
        recipe_id: recipeId,
        ingredient_id: ingredientId,
        quantity,
        unit_of_measure_id: unitId,
        notes,
      },
    });
  }

  async addStep(recipeId: number, stepNumber: number, description: string, imageUrl?: string, estimatedTime?: number) {
    return prisma.recipeStep.create({
      data: {
        recipe_id: recipeId,
        step_number: stepNumber,
        description,
        image_url: imageUrl,
        estimated_time: estimatedTime,
      },
    });
  }

  async getRecipe(recipeId: number) {
    return prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        ingredients: {
          include: { ingredient: true, unit_of_measure: true },
        },
        steps: true,
      },
    });
  }

  async listUserRecipes(userId: number) {
    return prisma.recipe.findMany({
      where: { user_id: userId },
      include: {
        ingredients: {
          include: { ingredient: true, unit_of_measure: true },
        },
        steps: true,
      },
    });
  }

  async deleteRecipe(recipeId: number, userId: number) {
    // solo elimina si es dueño
    return prisma.recipe.deleteMany({
      where: { id: recipeId, user_id: userId },
    });
  }
}
*/
