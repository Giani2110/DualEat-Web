import { Router } from "express";
import { CommunityController } from "../controllers/community.controller";

const router = Router();
const controller = new CommunityController();

router.post("/join", (req, res) => controller.join(req, res));
router.post("/leave", (req, res) => controller.leave(req, res));
router.get("/:communityId/members", (req, res) => controller.listMembers(req, res));
router.get("/user/:userId", (req, res) => controller.listUserCommunities(req, res));

export default router;