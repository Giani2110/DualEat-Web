import { prisma } from "../../../prisma/prisma";

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
