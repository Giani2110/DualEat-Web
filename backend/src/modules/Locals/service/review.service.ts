import { prisma } from "../../../prisma/prisma";

export class ReviewService {
  static async getReviews(localId: string) {
    return await prisma.localReview.findMany({
      where: { local_id: localId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
  }
}
