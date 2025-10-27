import { Router } from "express";

import { ChatController } from "../controllers/chat.controller";
import { RecipeService } from "../../recipe/recipe.service";

import { isAuthenticated } from "../../../middlewares/isAuthenticated";
import { iaLimiter } from "../../../middlewares/rateLimiter";

const recipeService = new RecipeService();
const controller = new ChatController(recipeService);

const router = Router();

// 1. Realizar pregunta a Ollama e iniciar/continuar chat
// =========================================================
router.post(
  "/ask",
  isAuthenticated,
  iaLimiter,
  controller.askOllama.bind(controller)
);

// 2. Realizar pregunta a Receta en Ollama e iniciar/continuar chat
// =========================================================
router.post(
  "/ask-recipe",
  isAuthenticated,
  iaLimiter,
  controller.askRecipe.bind(controller)
);

// 3. Obtener sesión de chat
// =========================================================
router.get(
  "/session",
  isAuthenticated,
  controller.getChatSession.bind(controller)
);

// 4. Obtener todas las sesiones de chat (solo título y chatId)
// =========================================================
router.get(
  "/all-sessions",
  isAuthenticated,
  controller.getChatSessions.bind(controller)
);

// 5. Eliminar sesión de chat
// =========================================================
router.delete(
  "/session",
  isAuthenticated,
  controller.deleteChatSession.bind(controller)
);

// 6. Eliminar todas las sesiones de chat
// =========================================================
router.delete(
  "/all-sessions",
  isAuthenticated,
  controller.deleteAllChatSessions.bind(controller)
);

export default router;
