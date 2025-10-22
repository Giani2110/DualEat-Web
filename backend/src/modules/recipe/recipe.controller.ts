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

  /** ASK OLLAMA */
  async askOllama(req: Request, res: Response) {
    const { question, type, ingredients, page, conversation } = req.body;

    try {
      const model = "llama3.2:1b";

      const messages = [
        ...(Array.isArray(conversation) ? conversation : []),
        { role: "user", content: question },
      ];

      if (type === "ask") {
        const response = await axios.post(`${ollamaConfig.host}/api/chat`, {
          model,
          messages,
          stream: false,
        });

        return res.json({
          success: true,
          comment: response.data.message?.content || "",
        });
      }

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
              messages: [
                ...(Array.isArray(conversation) ? conversation : []),
                { role: "user", content: prompt },
              ],
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
    const { question, recipe_id, conversation } = req.body;

    try {
      if (!recipe_id || typeof question !== "string") {
        return res
          .status(400)
          .json({ success: false, error: "Datos inválidos." });
      }

      const recipe = await this.recipeService.getRecipeById(recipe_id);
      if (!recipe) {
        return res
          .status(404)
          .json({ success: false, comment: "Receta no encontrada" });
      }

      // Contexto de la receta
      const recipeContext = [
        `Nombre: ${recipe.name}`,
        `Descripción: ${recipe.description || "Sin descripción"}`,
        `Ingredientes: ${(recipe.ingredients || [])
          .map(
            (ing: any) =>
              `${ing.ingredient?.name || ing.name} (${ing.quantity || ""} ${ing.unit_of_measure?.name || ""})`
          )
          .join(", ")}`,
        `Pasos: ${(recipe.steps || [])
          .map((s: any, i: number) => `${i + 1}) ${s.description}`)
          .join(" ")}`,
      ].join("\n");

      // Prompt del sistema MUY claro
      const systemMessage = `Sos un asistente de cocina de DualEat. 
      REGLA CRÍTICA: Solo usá la información de la receta si el usuario pregunta EXPLÍCITAMENTE sobre ella (ingredientes, pasos, tiempos, sustituciones, etc.). 

      Si el usuario:
      - Saluda o pregunta cosas generales (nombre, cómo estás, etc.) → Respondé brevemente SIN mencionar la receta
      - Pregunta sobre la receta → Usá la info de abajo para responder de forma concisa

      Receta disponible:
      ${recipeContext}`;

      const messages = [
        { role: "system", content: systemMessage },
        ...(Array.isArray(conversation) ? conversation : []),
        { role: "user", content: question },
      ];

      const response = await axios.post(`${ollamaConfig.host}/api/chat`, {
        model: "llama3.2:1b",
        messages,
        stream: false,
        temperature: 0.3,
      });

      const content = response.data?.message?.content || "Sin respuesta";

      return res.status(200).json({ success: true, comment: content });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
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
