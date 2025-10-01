import { Router } from "express";
import { CommunityTagService } from "../services/community-tag.service";
import { CommunityTagController } from "../controllers/community-tag.controller";

import { isAuthenticated } from "../../../middlewares/isAuthenticated";
import { generalLimiter } from "../../../middlewares/rateLimiter";

const router = Router();
const communityTagService = new CommunityTagService();
const communityTagController = new CommunityTagController(communityTagService);


// 1. Obtener todas las etiquetas
// ========================================================= 
router.get("/", communityTagController.getAll.bind(communityTagController));

// 2. Obtener todas las etiquetas por categorias (por id de la categoria)
// =========================================================
router.get("/tags/by-category", communityTagController.getByCategoryId.bind(communityTagController));

// 3. Crear una nueva etiqueta
// =========================================================
router.post("/tag", generalLimiter, isAuthenticated, communityTagController.create.bind(communityTagController));

// 4. Actualizar una etiqueta
// =========================================================
router.put("/tag/update", generalLimiter, isAuthenticated, communityTagController.update.bind(communityTagController));

// 5. Eliminar una etiqueta
// =========================================================
router.delete("/tag/update", generalLimiter, isAuthenticated, communityTagController.delete.bind(communityTagController));

export default router;
