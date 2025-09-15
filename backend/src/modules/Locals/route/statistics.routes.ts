import { Router } from "express";
import { StatisticsController } from "../controller/statistics.controller";

const router = Router();

// GET platos más vendidos de un local
router.get("/locals/:id/statistics/top-foods", StatisticsController.getTopFoods);

router.get('/local/:id/statistics/monthly-earnings', StatisticsController.getMonthlyEarnings);

export default router;