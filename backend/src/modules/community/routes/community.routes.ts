import { Router } from "express";
import { CommunityController } from "../controllers/community.controller";
import { CommunityService } from "../services/community.service";

import { isAuthenticated } from "../../../middlewares/isAuthenticated";
import { generalLimiter } from "../../../middlewares/rateLimiter";

import multer from "multer";

const upload = multer();

const router = Router();
const service = new CommunityService();
const controller = new CommunityController(service);

// 1. Obtener comunidad por slug (slug de la comunidad)
// =========================================================
router.get("/", isAuthenticated, controller.get.bind(controller));

// 2. Obtener todas las comunidades
// =========================================================
router.get("/all", controller.getAll.bind(controller));

// 3. Obtener todas las comunidades por tag (id de la etiqueta)
// =========================================================
router.get("/communities/tag", controller.getByTag.bind(controller));

// 4. Crear comunidad
// =========================================================
router.post(
  "/create",
  generalLimiter,
  isAuthenticated,
  upload.fields([
    { name: "banner", maxCount: 1 },
    { name: "icon", maxCount: 1 },
  ]),
  controller.create.bind(controller)
);

// 5. Unirse a comunidad
// =========================================================
router.post("/join", generalLimiter, isAuthenticated, controller.join.bind(controller));

// 6. Salir de comunidad
// =========================================================
router.post("/leave", generalLimiter, isAuthenticated, controller.leave.bind(controller));

// 7.Obtener las comunidades de un usuario
// =========================================================
router.get("/user", isAuthenticated, controller.getUserCommunities.bind(controller));

// 8. Obtener posts de una comunidad
// =========================================================
router.get("/posts", isAuthenticated, controller.getPosts.bind(controller));



router.get("/recommended", controller.getRecommended.bind(controller));
router.get("/popular", controller.getPopular.bind(controller));
router.get("/trending", controller.getTrending.bind(controller));



export default router;
