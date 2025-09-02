import { Request, Response } from "express";
import { ReviewService } from "../service/review.service";

export class ReviewController {
  static async getReviews(req: Request, res: Response) {
    try {
      const localId = parseInt(req.params.id);

      if (isNaN(localId)) {
        return res.status(400).json({ error: "El ID del local no es válido." });
      }

      const reviews = await ReviewService.getReviews(localId);

      return res.json(reviews);
    } catch (error) {
      console.error("Error al obtener reseñas:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}
