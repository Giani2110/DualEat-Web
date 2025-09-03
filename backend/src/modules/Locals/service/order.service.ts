import { prisma } from "../../../prisma/prisma";
import { OrderStatus } from "@prisma/client";

export class OrderService {
  static async getOrders(
    localId: number,
    status?: string,
    from?: string,
    to?: string
  ) {
    // Validar y castear el status a enum
    let statusEnum: OrderStatus | undefined;
    if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
      statusEnum = status as OrderStatus;
    }

    return await prisma.order.findMany({
      where: {
        local_id: localId,
        status: statusEnum, // solo si es un valor válido
        created_at: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      orderBy: {
        created_at: "desc",
      },
      include: {
        order_items: {
          include: {
            food: true, // trae info del plato
          },
        },
      },
    });
  }
}