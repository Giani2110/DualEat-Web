import { Router } from "express";
import { VoteController } from "./vote.controller";
import { VoteService } from "./vote.service";
import { isAuthenticated } from "../../middlewares/isAuthenticated";

const router = Router();
const service = new VoteService();
const controller = new VoteController(service);

// 1. Crear un voto
// =========================================================
router.post("/create", isAuthenticated, controller.create.bind(controller));

export default router;
