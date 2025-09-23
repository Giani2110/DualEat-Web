import { Router } from "express";

import { PostController } from "../controllers/post.controller";
import { PostService } from "../services/post.service";

import { isAuthenticated } from "../../../middlewares/isAuthenticated";
import { generalLimiter } from "../../../middlewares/rateLimiter";

import multer from "multer";

const upload = multer();

const router = Router();
const service = new PostService();
const controller = new PostController(service);

// 1. Crear post (opcional receta)
// =========================================================
router.post("/create", generalLimiter, isAuthenticated,  upload.any(), controller.create.bind(controller));

export default router;
