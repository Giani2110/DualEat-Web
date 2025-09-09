import { Request, Response } from "express";
import { ManualLoadMenuService } from "../service/manualLoadMenu.service";

export class ManualLoadMenuController {
  static async createFood(req: Request, res: Response) {
    try {
      const localId = parseInt(req.params.localId);
      if (isNaN(localId)) {
        return res.status(400).json({ error: "Invalid localId" });
      }

      const { category_id, name, description, price, discount, image_url, available } = req.body;

      if (!name || !price) {
        return res.status(400).json({ error: "Name and price are required" });
      }

      const food = await ManualLoadMenuService.createFood(localId, {
        category_id,
        name,
        description,
        price,
        discount,
        image_url,
        available
      });

      return res.status(201).json(food);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}