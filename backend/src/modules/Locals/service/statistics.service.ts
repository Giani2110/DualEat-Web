import { prisma } from "../../../prisma/prisma";

export class StatisticsService {
  /**
   * Platos más vendidos en un local
   */
  static async getTopFoods(localId: number, from?: string, to?: string) {
    const results = await prisma.orderItem.groupBy({
      by: ["food_id"],
      where: {
        order: {
          local_id: localId,
          created_at: {
            gte: from ? new Date(from) : undefined,
            lte: to ? new Date(to) : undefined,
          },
          status: "confirmed",
        },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 7, // top 7
    });

    // Traer nombres de los platos de una sola vez
    const foods = await prisma.food.findMany({
      where: { id: { in: results.map(r => r.food_id) } },
      select: { id: true, name: true },
    });

    const foodMap = Object.fromEntries(foods.map(f => [f.id, f.name]));

    return results.map(r => ({
      plato: foodMap[r.food_id] || "Desconocido",
      cantidad: r._sum.quantity || 0,
    }));
  }

  /**
   * Métricas generales de un local (ventas totales y cantidad de pedidos)
   */
  static async getLocalMetrics(localId: number, from?: string, to?: string) {
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

  static async getMonthlyLocalEarnings(localId: number, from: string, to: string) {
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
    });
  
    // 2. Procesar y agrupar los resultados por mes y año
    const monthlyEarnings = orders.reduce((acc: { [key: string]: number }, order) => {
      const monthYear = order.created_at.toISOString().slice(0, 7);
  
      // Si el mes no existe, lo inicializa
      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
  
      // Sumar el total del pedido al mes correspondiente
      acc[monthYear] += order.total;
  
      return acc;
    }, {});
  
    // 3. Convertir el objeto a un array de objetos
    return Object.entries(monthlyEarnings).map(([month, total]) => ({
      mes: month,
      ganancia: total,
    }));
  }
}