import { Router } from "express";
import { TagCategoryController } from "../controllers/tag-category.controller";
import { TagCategoryService } from "../services/tag-category.service";

const router = Router();
const tagCategoryService = new TagCategoryService();
const tagCategoryController = new TagCategoryController(tagCategoryService);

router.get("/", tagCategoryController.getAll.bind(tagCategoryController));

export default router;