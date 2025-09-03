import { Router } from "express";
import { StatisticsController } from "../controller/statistics.controller";

const router = Router();

// GET platos más vendidos de un local
router.get("/locals/:id/statistics/top-foods", StatisticsController.getTopFoods);

export default router;