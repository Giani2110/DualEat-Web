import { Request, Response } from "express";
import { RecipeService } from "../services/recipe.service";

const service = new RecipeService();

export class RecipeController {
  async createRecipe(req: Request, res: Response) {
    const { userId, name, description } = req.body;
    try {
      const recipe = await service.createRecipe(Number(userId), name, description);
      res.json(recipe);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async addIngredient(req: Request, res: Response) {
    const { recipeId, ingredientId, quantity, unitId, notes } = req.body;
    try {
      const ing = await service.addIngredient(Number(recipeId), Number(ingredientId), Number(quantity), Number(unitId), notes);
      res.json(ing);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async addStep(req: Request, res: Response) {
    const { recipeId, stepNumber, description, imageUrl, estimatedTime } = req.body;
    try {
      const step = await service.addStep(Number(recipeId), Number(stepNumber), description, imageUrl, estimatedTime ? Number(estimatedTime) : undefined);
      res.json(step);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getRecipe(req: Request, res: Response) {
    const { recipeId } = req.params;
    const recipe = await service.getRecipe(Number(recipeId));
    res.json(recipe);
  }

  async listUserRecipes(req: Request, res: Response) {
    const { userId } = req.params;
    const recipes = await service.listUserRecipes(Number(userId));
    res.json(recipes);
  }

  async deleteRecipe(req: Request, res: Response) {
    const { recipeId, userId } = req.body;
    const result = await service.deleteRecipe(Number(recipeId), Number(userId));
    if (result.count === 0) {
      return res.status(403).json({ error: "No autorizado o receta inexistente" });
    }
    res.json({ message: "Receta eliminada" });
  }
}
