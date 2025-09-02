import { prisma } from "../../../prisma/prisma";

export class CritiqueService {
  static async createReview(localId: number, userId: number, rating: number, comment?: string) {
    return await prisma.localReview.create({
      data: {
        local_id: localId,
        user_id: userId,
        rating,
        comment,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }
}