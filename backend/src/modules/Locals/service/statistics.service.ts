import { prisma } from "../../../prisma/prisma";

export class StatisticsService {
  static async getTopFoods(localId: number, from?: string, to?: string) {
    return await prisma.orderItem.groupBy({
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
      _sum: {
        quantity: true,
        subtotal: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
    });
  }

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
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      total_sales: metrics._sum.total || 0,
      total_orders: metrics._count.id || 0,
    };
  }
}