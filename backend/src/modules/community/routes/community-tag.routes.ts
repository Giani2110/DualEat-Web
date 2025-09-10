import { Router } from "express";
import { CommunityTagService } from "../services/community-tag.service";
import { CommunityTagController } from "../controllers/community-tag.controller";

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
router.post("/tag", communityTagController.create.bind(communityTagController));

// 4. Actualizar una etiqueta
// =========================================================
router.put("/tag/:id", communityTagController.update.bind(communityTagController));

// 5. Eliminar una etiqueta
// =========================================================
router.delete("/tag/:id", communityTagController.delete.bind(communityTagController));

export default router;
