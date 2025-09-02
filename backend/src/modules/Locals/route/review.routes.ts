import { Router } from "express";
import { ReviewController } from "../controller/review.controller";

const router = Router();

// GET /locals/:id/reviews
router.get("/locals/:id/reviews", ReviewController.getReviews);

export default router;