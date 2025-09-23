import { Request, Response } from "express";
import { RecipeService } from "../services/recipe.service";

import { ollamaConfig } from "../../../config/config";

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
    const { name, user_id, community_id } = req.query;
    try {
      const recipe = await this.recipeService.getRecipeValidation(
        name as string,
        Number(user_id),
        Number(community_id)
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
      const recipe = await this.recipeService.getRecipeById(Number(id));
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
    const { user_id } = req.params;
    try {
      const recipes = await this.recipeService.getUserRecipes(Number(user_id));
      res.status(200).json({ success: true, data: recipes });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /** ASK OLLAMA */
  async askOllama(req: Request, res: Response) {
    const { question, type, ingredients, page } = req.body;

    try {
      const model = "llama3.2:1b";
      // Para preguntas generales (sin cambios)
      if (type === "ask") {
        const response = await axios.post(`${ollamaConfig.host}/api/chat`, {
          model,
          messages: [{ role: "user", content: question }],
          stream: false,
        });

        return res.json({
          success: true,
          comment: response.data.message?.content || "",
        });
      }

      // Para recetas o ingredientes con paginación
      if (type === "recipe" || type === "ingredient") {
        const result = await this.recipeService.ask({
          type,
          question,
          ingredients: Array.isArray(ingredients) ? ingredients : [],
          page: parseInt(page),
          limit: 20,
        });

        if (!result.data || result.data.length === 0) {
          return res.status(200).json({
            success: true,
            data: [],
            pagination: result.pagination,
            comment:
              page === 1
                ? "Perdón, no encontré ninguna receta con dicho nombre."
                : "No hay más recetas disponibles.",
          });
        }

        // Generar comentario solo para la primera página
        let comentario = "";
        if (page === 1) {
          const nombres = result.data
            .slice(0, 5)
            .map((r: any) => `- ${r.name}`)
            .join("\n");

          if (nombres) {
            const prompt = `¿Qué opinas de estas recetas:\n${nombres}`;

            const response = await axios.post(`${ollamaConfig.host}/api/chat`, {
              model,
              messages: [{ role: "user", content: prompt }],
              stream: false,
            });

            comentario = response.data.message?.content || "";
          }
        } else {
          comentario = `Mostrando ${result.data.length} recetas adicionales (página ${page} de ${result.pagination.totalPages})`;
        }

        return res.status(200).json({
          success: true,
          data: result.data,
          pagination: result.pagination,
          comment: comentario,
        });
      }

      return res.status(400).json({
        success: false,
        error: "Tipo de solicitud no válido.",
      });
    } catch (error: any) {
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  }

  async askRecipe(req: Request, res: Response) {
    const { question, recipe_id } = req.body;

    try {
      if (!recipe_id || typeof question !== "string") {
        return res
          .status(400)
          .json({ success: false, error: "Datos inválidos." });
      }

      const model = "llama3.2:1b";
      const recipe = await this.recipeService.getRecipeById(Number(recipe_id));
      if (!recipe) {
        return res
          .status(404)
          .json({ success: false, comment: "Receta no encontrada" });
      }

      const prompt = [
        `El usuario pregunta: "${question}"`,
        `Aquí está la receta completa para que la analices:`,
        `Nombre: ${recipe.name}`,
        `Descripción: ${recipe.description || "Sin descripción"}`,
        `Ingredientes y cantidades:\n${recipe.ingredients.map((ing) => `- ${ing.ingredient.name} - ${ing.quantity} ${ing.unit_of_measure.name}`).join("\n")}`,
        `Pasos:\n${recipe.steps.map((step, i) => `${i + 1}. ${step.description}`).join("\n")}`,
      ].join("\n\n");

      const response = await axios.post(`${ollamaConfig.host}/api/chat`, {
        model,
        messages: [{ role: "user", content: prompt }],
        stream: false,
      });

      return res.status(200).json({
        success: true,
        comment: response.data.message?.content || "Sin respuesta",
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /*
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
    */
}
