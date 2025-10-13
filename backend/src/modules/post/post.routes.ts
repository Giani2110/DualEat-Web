import { Router } from "express";

import { PostController } from "./post.controller";
import { PostService } from "./post.service";

import { isAuthenticated } from "../../middlewares/isAuthenticated";
import { generalLimiter } from "../../middlewares/rateLimiter";

import multer from "multer";

const upload = multer();

const router = Router();
const service = new PostService();
const controller = new PostController(service);

// 1. Crear post (opcional receta)
// =========================================================
router.post(
  "/create",
  generalLimiter,
  isAuthenticated,
  upload.any(),
  controller.create.bind(controller)
);

// 2. Obtener post por slug (slug de la comunidad)
// =========================================================
router.get("/", isAuthenticated, controller.getBySlug.bind(controller));

// 3. Crear comentario para un post
// =========================================================
router.post(
  "/comment",
  generalLimiter,
  isAuthenticated,
  controller.createComment.bind(controller)
);

router.post("/test", upload.any(), controller.create.bind(controller));

export default router;
