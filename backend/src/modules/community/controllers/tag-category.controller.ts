import { Request, Response } from "express";
import { TagCategoryService } from "../services/tag-category.service";

export class TagCategoryController {
    constructor(private tagCategoryService: TagCategoryService) {}

    async getAll(req: Request, res: Response) {
        try {
            const tagCategories = await this.tagCategoryService.getAllTagCategories();
            res.status(200).json({ success: true, data: tagCategories });
        } catch (error) {
            res
                .status(500)
                .json({ success: false, message: "Error al obtener categorias de tags" }
            );
        }
    }
}