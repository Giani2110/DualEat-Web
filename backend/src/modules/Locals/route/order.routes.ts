import { Router } from "express";
import { OrderController } from "../controller/order.controller";

const router = Router();

// GET pedidos de un local
router.get("/locals/:id/orders", OrderController.getOrders);

export default router;
