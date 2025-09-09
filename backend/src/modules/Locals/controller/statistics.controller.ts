import { Request, Response } from "express";
import { StatisticsService } from "../service/statistics.service";

export class StatisticsController {
  static async getTopFoods(req: Request, res: Response) {
    try {
      const localId = parseInt(req.params.id);
      const { from, to } = req.query;

      if (isNaN(localId)) {
        return res.status(400).json({ error: "El ID del local no es válido." });
      }

      // obtener top foods ya enriquecidos desde el service
      const topFoods = await StatisticsService.getTopFoods(
        localId,
        from as string,
        to as string
      );

      // métricas generales del local
      const metrics = await StatisticsService.getLocalMetrics(
        localId,
        from as string,
        to as string
      );

      return res.json({
        metrics,
        top_foods: topFoods,
      });
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}