import { Request, Response } from "express";
import { StatisticsService } from "../service/statistics.service";

export class StatisticsController {
  // Mantén este método sin cambios para su propósito original
  static async getTopFoods(req: Request, res: Response) {
    try {
      const localId = parseInt(req.params.id);
      const { from, to } = req.query;

      if (isNaN(localId)) {
        return res.status(400).json({ error: "El ID del local no es válido." });
      }

      const topFoods = await StatisticsService.getTopFoods(
        localId,
        from as string,
        to as string
      );

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

  // Nuevo método para manejar las ganancias mensuales
  static async getMonthlyEarnings(req: Request, res: Response) {
    try {
      const localId = parseInt(req.params.id);
      const { from, to } = req.query;

      // Se requieren las fechas de inicio y fin para este cálculo
      if (!from || !to || isNaN(localId)) {
        return res.status(400).json({ error: "Parámetros inválidos. Se requiere el ID del local, 'from' y 'to'." });
      }

      // Llamada al nuevo método del servicio
      const monthlyEarnings = await StatisticsService.getMonthlyLocalEarnings(
        localId,
        from as string,
        to as string
      );

      return res.json(monthlyEarnings);
    } catch (error) {
      console.error("Error al obtener ganancias mensuales:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}