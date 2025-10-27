import { Request, Response } from "express";
import { RecipeService } from "./recipe.service";

import { ollamaConfig } from "../../config/config";

import axios from "axios";

export class RecipeController {
  constructor(private recipeService: RecipeService) {}

  /** GET INGREDIENTS */
  async getAllIngredients(req: Request, res: Response) {
    try {
      const ingredients = await this.recipeService.getAllIngredients();
      res.status(200).json({ success: true, data: ingredients });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /** GET UNITS */
  async getAllUnits(req: Request, res: Response) {
    try {
      const units = await this.recipeService.getAllUnits();
      res.status(200).json({ success: true, data: units });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /** GET RECIPE BY NAME */
  async getRecipeValidation(req: Request, res: Response) {
    const { name, community_id } = req.query;
    const user_id = (req as any).user?.id;
    try {
      const recipe = await this.recipeService.getRecipeValidation(
        name as string,
        user_id as string,
        community_id as string
      );

      if (recipe) {
        return res.status(200).json({ success: true, data: recipe });
      }
      return res
        .status(404)
        .json({ success: false, error: "Receta no encontrada" });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /** GET RECIPE BY ID */
  async getRecipeById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const recipe = await this.recipeService.getRecipeById(id);
      if (recipe) {
        return res.status(200).json({ success: true, data: recipe });
      }
      return res
        .status(404)
        .json({ success: false, message: "Receta no encontrada" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /** GET USER RECIPES */
  async getUserRecipes(req: Request, res: Response) {
    const user_id = (req as any).user?.id;
    try {
      const recipes = await this.recipeService.getUserRecipes(user_id);
      res.status(200).json({ success: true, data: recipes });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /** GET RECIPE BY SLUG */
  async getRecipeBySlug(req: Request, res: Response) {
    const { communitySlug, recipeSlug, userSlug } = req.query;

    try {
      if (!communitySlug || !recipeSlug || !userSlug) {
        return res
          .status(400)
          .json({ success: false, message: "Faltan parámetros obligatorios" });
      }

      const recipe = await this.recipeService.getRecipeBySlug(
        communitySlug as string,
        recipeSlug as string,
        userSlug as string
      );

      if (recipe) {
        return res.status(200).json({ success: true, data: recipe });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Receta no encontrada" });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Error interno del servidor",
      });
    }
  }
}
