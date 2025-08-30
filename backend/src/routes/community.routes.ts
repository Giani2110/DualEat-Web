import { Router } from "express";
import { CommunityController } from "../controllers/community.controller";
import { CommunityService } from "../services/community.service";

const router = Router();
const service = new CommunityService();
const controller = new CommunityController(service);

router.get("/", controller.get.bind(controller));
router.get("/all", controller.getAll.bind(controller));
router.post("/create", controller.create.bind(controller));
router.post("/join", controller.join.bind(controller));
router.post("/leave", controller.leave.bind(controller));
router.get("/:communityId/members", controller.listMembers.bind(controller));
router.get("/user", controller.listUserCommunities.bind(controller));

export default router;