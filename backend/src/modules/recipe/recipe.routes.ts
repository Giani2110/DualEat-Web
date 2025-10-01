import { Router } from "express";
import { RecipeController } from "./recipe.controller";
import { RecipeService } from "./recipe.service";

import { isAuthenticated } from "../../middlewares/isAuthenticated";
import { iaLimiter } from "../../middlewares/rateLimiter";

const router = Router();
const service = new RecipeService();
const controller = new RecipeController(service);

// 1. Obtener todos los ingredientes
// =========================================================
router.get("/ingredients", controller.getAllIngredients.bind(controller));

// 2. Obtener todas las unidades
// =========================================================
router.get("/units", controller.getAllUnits.bind(controller));

// 3. Obtener receta por name (Validation de receta) // Si el usuario postea la misma receta en la misma comunidad con mismo nombre
// =========================================================
router.get("/", controller.getRecipeValidation.bind(controller));

// 4. Obtener recetas del usuario
// =========================================================
router.get(
  "/user",
  isAuthenticated,
  controller.getUserRecipes.bind(controller)
);

// 5. Obtener receta por id
// =========================================================
router.get("/:id", controller.getRecipeById.bind(controller));

// 6. Ask Ollama
// =========================================================
router.post(
  "/ask",
  iaLimiter,
  isAuthenticated,
  controller.askOllama.bind(controller)
);

// 7. Ask Ollama (Recipe)
// =========================================================
router.post(
  "/ask-recipe",
  iaLimiter,
  isAuthenticated,
  controller.askRecipe.bind(controller)
);

/*
// Crear receta
router.post("/create", (req, res) => controller.createRecipe(req, res));

// Ver ingredientes por nombre

// Agregar ingrediente a receta
router.post("/ingredient", (req, res) => controller.addIngredient(req, res));

// Agregar paso a receta
router.post("/step", (req, res) => controller.addStep(req, res));

// Obtener receta completa
router.get("/:recipeId", (req, res) => controller.getRecipe(req, res));

// Listar recetas de un usuario
router.get("/user/:userId", (req, res) => controller.listUserRecipes(req, res));

// Eliminar receta
router.delete("/", (req, res) => controller.deleteRecipe(req, res));
*/

export default router;
