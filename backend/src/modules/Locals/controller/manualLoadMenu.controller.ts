import { Request, Response } from "express";
import { ManualLoadMenuService } from "../service/manualLoadMenu.service";

export class ManualLoadMenuController {
  static async createFood(req: Request, res: Response) {
    try {
      const localId = parseInt(req.params.localId);
      if (isNaN(localId)) {
        return res.status(400).json({ error: "Invalid localId" });
      }

      const { 
        category_id, 
        local_menu_category_id, // Agregar este campo
        name, 
        description, 
        price, 
        discount, 
        image_url, 
        available 
      } = req.body;

      if (!name || !price) {
        return res.status(400).json({ error: "Name and price are required" });
      }

      const food = await ManualLoadMenuService.createFood(localId, {
        category_id,
        local_menu_category_id,
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

  // Agregar método para actualizar comida
  static async updateFood(req: Request, res: Response) {
    try {
      const foodId = parseInt(req.params.id);
      if (isNaN(foodId)) {
        return res.status(400).json({ error: "Invalid food ID" });
      }

      const { 
        category_id, 
        local_menu_category_id,
        name, 
        description, 
        price, 
        discount, 
        image_url, 
        available 
      } = req.body;

      const food = await ManualLoadMenuService.updateFood(foodId, {
        category_id,
        local_menu_category_id,
        name,
        description,
        price,
        discount,
        image_url,
        available
      });

      return res.status(200).json(food);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Agregar método para crear múltiples comidas
  static async createFoodsBulk(req: Request, res: Response) {
    try {
      const localId = parseInt(req.params.localId);
      if (isNaN(localId)) {
        return res.status(400).json({ error: "Invalid localId" });
      }

      const { dishes } = req.body;
      
      if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
        return res.status(400).json({ error: "Dishes array is required" });
      }

      const foods = await ManualLoadMenuService.createFoodsBulk(localId, dishes);

      return res.status(201).json({ data: foods });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}