import { Request, Response } from "express";
import { CritiqueService } from "../service/critique.service";

export class CritiqueController {
  static async createReview(req: Request, res: Response) {
    try {
      const localId = req.params.id;
      const { userId, rating, comment } = req.body;

      if (typeof localId !== "string" || !localId) {
        return res.status(400).json({ error: "El ID del local no es válido." });
      }

      if (!userId || !rating) {
        return res.status(400).json({ error: "Faltan campos obligatorios: userId y rating." });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: "El rating debe estar entre 1 y 5." });
      }

      const review = await CritiqueService.createReview(localId, userId, rating, comment);

      return res.status(201).json(review);
    } catch (error: any) {
      console.error("Error al crear reseña:", error);

      if (error.code === "P2002") {
        // Prisma unique constraint violation
        return res.status(400).json({ error: "El usuario ya dejó una reseña en este local." });
      }

      return res.status(500).json({ error: "Error interno del servidor." });
    }
  }
}
