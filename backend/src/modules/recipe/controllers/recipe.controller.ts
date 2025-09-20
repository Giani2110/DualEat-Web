import { Request, Response } from "express";
import { RecipeService } from "../services/recipe.service";

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
      res.status(200).json({ success: true, data: recipe });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /** ASK OLLAMA */
  async askOllama(req: Request, res: Response) {
  const { question, type } = req.body;

  try {
    const ollamaHost = process.env.OLLAMA_HOST;

    if (type === "ask") {
      const response = await axios.post(
        `${ollamaHost}/api/chat`,
        {
          model: "llama3",
          messages: [
            { role: "system", content: "Responde siempre en español." },
            { role: "user", content: question }],
          stream: true,
        },
        { responseType: "stream" }
      );

      let fullResponse = "";

      response.data.on("data", (chunk: Buffer) => {
        const lines = chunk.toString().split("\n").filter(line => line.trim() !== "");
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            fullResponse += parsed.message?.content || "";
          } catch {}
        }
      });

      response.data.on("end", () => {
        res.json({ success: true, answer: fullResponse });
      });

      response.data.on("error", (err: any) => {
        res.status(500).json({ success: false, error: err.message });
      });
    }

    if (type === "recipe" || type === "ingredient") {
      const data = await this.recipeService.ask(type, question);

      const nombres = data?.map((r: any) => `- ${r.name}`).join("\n");
      const prompt = `Estas son las recetas encontradas:\n${nombres}\n\nHaz una breve descripción de cada una y sugiere cuál podría gustarle al usuario. RESPONDE EN ESPAÑOL.`;

      const response = await axios.post(`${ollamaHost}/api/chat`, {
        model: "llama3",
        messages: [{ role: "user", content: prompt }],
        stream: false
      });

      const comentario = response.data.message?.content || "";

      res.status(200).json({
        success: true,
        data,
        comment: comentario
      });
    }

    else {
      res.status(400).json({ success: false, error: "Tipo de solicitud no válido." });
    }
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
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
