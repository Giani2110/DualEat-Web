import { Router } from "express";
import { CommunityTagService } from "../services/community-tag.service";
import { CommunityTagController } from "../controllers/community-tag.controller";

const router = Router();
const communityTagService = new CommunityTagService();
const communityTagController = new CommunityTagController(communityTagService);

router.post("/tags", communityTagController.create.bind(communityTagController));

router.get("/", communityTagController.getAll.bind(communityTagController));

router.get("/tags/:id", communityTagController.getById.bind(communityTagController));

router.put("/tags/:id", communityTagController.update.bind(communityTagController));

router.delete("/tags/:id", communityTagController.delete.bind(communityTagController));

export default router;
