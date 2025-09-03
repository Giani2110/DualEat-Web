import { Request, Response } from "express";
import { StatisticsService } from "../service/statistics.service";
import { prisma } from "../../../prisma/prisma";

export class StatisticsController {
  static async getTopFoods(req: Request, res: Response) {
    try {
      const localId = parseInt(req.params.id);
      const { from, to } = req.query;

      if (isNaN(localId)) {
        return res.status(400).json({ error: "El ID del local no es válido." });
      }

      const stats = await StatisticsService.getTopFoods(localId, from as string, to as string);

      const enrichedStats = await Promise.all(
        stats.map(async (stat) => {
          const food = await prisma.food.findUnique({
            where: { id: stat.food_id },
            select: { id: true, name: true, image_url: true },
          });
          return {
            ...food,
            total_quantity: stat._sum.quantity || 0,
            total_sales: stat._sum.subtotal || 0,
          };
        })
      );

      // métricas generales del local
      const metrics = await StatisticsService.getLocalMetrics(localId, from as string, to as string);

      return res.json({
        metrics,
        top_foods: enrichedStats,
      });
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}