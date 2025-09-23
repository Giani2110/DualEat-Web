import { Router } from "express";
import multer from "multer";
import { uploadMenuController } from "../controllers/localDashboard.controller";
import { bulkSaveFoodsController } from "../controllers/localDashboard.controller";

import { generalLimiter } from "../middlewares/rateLimiter";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/local/:localId/menu-upload",
  generalLimiter,
  upload.single("menuImage"),
  uploadMenuController
);

router.post("/locals/:localId/manual-menu/bulk", bulkSaveFoodsController);
export default router;
