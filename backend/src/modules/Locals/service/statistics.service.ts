import { prisma } from "../../../prisma/prisma";

export class StatisticsService {
  static async getTopFoods(localId: string, from?: string, to?: string) {
    const results = await prisma.orderItem.groupBy({
      by: ["food_id"],
      where: {
        order: {
          local_id: localId,
          created_at: {
            // Se asegura que los filtros de fecha se apliquen
            gte: from ? new Date(from) : undefined,
            lte: to ? new Date(to) : undefined,
          },
          status: "confirmed",
        },
      },
      _sum: {
        quantity: true,
        unit_price: true, // Agregado para el cálculo del total
      },
      orderBy: { _sum: { quantity: "desc" } },
      take: 7, // top 7
    }); // Traer nombres y precios de los platos de una sola vez
    const foods = await prisma.food.findMany({
      where: { id: { in: results.map((r) => r.food_id) } },
      select: { id: true, name: true, price: true }, // Se añadió price
    });
    const foodMap = new Map(foods.map((f) => [f.id, f]));
    return results.map((r) => {
      const food = foodMap.get(r.food_id);
      const quantity = r._sum.quantity || 0;
      const revenue = quantity * (food?.price || 0);
      return {
        food_id: r.food_id,
        name: food?.name || "Desconocido",
        total_quantity: quantity,
        total_revenue: revenue,
      };
    });
  } /**
   * Métricas generales de un local (ventas totales y cantidad de pedidos)
   */

  static async getLocalMetrics(localId: string, from?: string, to?: string) {
    const metrics = await prisma.order.aggregate({
      where: {
        local_id: localId,
        status: "confirmed",
        created_at: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      _sum: { total: true },
      _count: { id: true },
    });

    return {
      total_sales: metrics._sum.total || 0,
      total_orders: metrics._count.id || 0,
    };
  }

  static async getMonthlyLocalEarnings(
    localId: string,
    from: string,
    to: string
  ) {
    const orders = await prisma.order.findMany({
      where: {
        local_id: localId,
        status: "confirmed",
        created_at: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
      select: {
        total: true,
        created_at: true,
      },
      orderBy: {
        created_at: "asc",
      },
    }); // Agrupar los pedidos por mes y calcular totales
    const monthlySummary: {
      [key: string]: { total_earnings: number; total_orders: number };
    } = {};
    orders.forEach((order) => {
      const monthYear = order.created_at.toISOString().slice(0, 7);
      if (!monthlySummary[monthYear]) {
        monthlySummary[monthYear] = { total_earnings: 0, total_orders: 0 };
      }
      monthlySummary[monthYear].total_earnings += order.total;
      monthlySummary[monthYear].total_orders += 1;
    }); // Corregido: Mapear a la estructura final
    return Object.entries(monthlySummary).map(([month, data]) => ({
      mes: month,
      ganancia: data.total_earnings,
      pedidos: data.total_orders,
    }));
  }
}
