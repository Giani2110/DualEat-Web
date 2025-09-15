import { Router } from "express";
import { CommunityController } from "../controllers/community.controller";
import { CommunityService } from "../services/community.service";

import multer from "multer";

const upload = multer();

const router = Router();
const service = new CommunityService();
const controller = new CommunityController(service);

// 1. Obtener comunidad por name (name de la comunidad)
// =========================================================
router.get("/", controller.get.bind(controller));

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
  upload.fields([
    { name: "banner", maxCount: 1 },
    { name: "icon", maxCount: 1 },
  ]),
  controller.create.bind(controller)
);

router.get("/recommended", controller.getRecommended.bind(controller));
router.get("/popular", controller.getPopular.bind(controller));
router.get("/trending", controller.getTrending.bind(controller));


router.post("/join", controller.join.bind(controller));
router.post("/leave", controller.leave.bind(controller));
router.get("/:communityId/members", controller.listMembers.bind(controller));
router.get("/user", controller.listUserCommunities.bind(controller));

export default router;
