import { Router } from "express";
import { ManualLoadMenuController } from "../controller/manualLoadMenu.controller";

const router = Router();

// Crear comida en un local
router.post("/locals/:localId/manual-menu", ManualLoadMenuController.createFood);

// Crear múltiples comidas en un local (bulk)
router.post("/locals/:localId/manual-menu/bulk", ManualLoadMenuController.createFoodsBulk);

// Actualizar comida
router.put("/foods/:id", ManualLoadMenuController.updateFood);

export default router;