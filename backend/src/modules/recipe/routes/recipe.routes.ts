import { Router } from "express";
import { RecipeController } from "../controllers/recipe.controller";
import { RecipeService } from "../services/recipe.service";

const router = Router();
const service = new RecipeService();
const controller = new RecipeController(service);

// 1. Obtener todos los ingredientes
// =========================================================
router.get("/ingredients", controller.getAllIngredients.bind(controller));

// 2. Obtener todas las unidades
// =========================================================
router.get("/units", controller.getAllUnits.bind(controller));



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
