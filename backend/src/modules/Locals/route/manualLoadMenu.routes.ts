import { Router } from "express";
import { ManualLoadMenuController } from "../controller/manualLoadMenu.controller";

const router = Router();

// Crear comida en un local
router.post("/locals/:localId/manual-menu", ManualLoadMenuController.createFood);

export default router;
