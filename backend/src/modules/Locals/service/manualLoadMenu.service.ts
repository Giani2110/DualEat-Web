import { prisma } from "../../../prisma/prisma";

export class ManualLoadMenuService {
  static async createFood(localId: number, data: {
    category_id?: number;
    name: string;
    description?: string;
    price: number;
    discount?: boolean;
    image_url?: string;
    available?: boolean;
  }) {
    const local = await prisma.local.findUnique({
      where: { id: localId }
    });
    if (!local) {
      throw new Error("Local not found");
    }

    const food = await prisma.food.create({
      data: {
        local_id: localId,
        category_id: data.category_id ?? null,
        name: data.name,
        description: data.description,
        price: data.price,
        discount: data.discount ?? false,
        image_url: data.image_url ?? null,
        available: data.available ?? true
      }
    });

    return food;
  }
}