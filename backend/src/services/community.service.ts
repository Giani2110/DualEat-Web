import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export class CommunityService {
  async joinCommunity(userId: number, communityId: number) {
    // verificar si ya es miembro
    const exists = await prisma.communityMember.findUnique({
      where: { user_id_community_id: { user_id: userId, community_id: communityId } },
    });
    if (exists) throw new Error("Ya es miembro");

    // crear miembro y aumentar contador
    const member = await prisma.communityMember.create({
      data: { user_id: userId, community_id: communityId },
    });

    await prisma.community.update({
      where: { id: communityId },
      data: { total_members: { increment: 1 } },
    });

    return member;
  }

  async leaveCommunity(userId: number, communityId: number) {
    // verificar que sea miembro
    const exists = await prisma.communityMember.findUnique({
      where: { user_id_community_id: { user_id: userId, community_id: communityId } },
    });
    if (!exists) throw new Error("No es miembro");

    // borrar miembro y decrementar contador
    await prisma.communityMember.delete({
      where: { user_id_community_id: { user_id: userId, community_id: communityId } },
    });

    await prisma.community.update({
      where: { id: communityId },
      data: { total_members: { decrement: 1 } },
    });

    return { message: "Eliminado de la comunidad" };
  }

  async getCommunityMembers(communityId: number) {
    return prisma.communityMember.findMany({
      where: { community_id: communityId },
      include: { user: true },
    });
  }

  async getUserCommunities(userId: number) {
    return prisma.communityMember.findMany({
      where: { user_id: userId },
      include: { community: true },
    });
  }
}