import { Router } from "express";
import { CritiqueController } from "../controller/critique.controller";

const router = Router();

router.post("/locals/:id/reviews", CritiqueController.createReview);

export default router;