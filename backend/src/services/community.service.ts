import { prisma } from "../prisma/prisma";
import { CreateCommunityDTO } from "../interfaces/community.dto";

export class CommunityService {
  constructor() {}

  async createCommunity(data: CreateCommunityDTO) {
  const community = await prisma.community.create({
    data: {
      name: data.name,
      description: data.description,
      image_url: data.image_url,
      theme_color: data.theme_color,
      visibility: data.visibility,
      creator_id: data.creator_id,
      total_members: 1,
      tags: {
        connect: data.selectedTags.map(id => ({ id })),
      },
    },
  });

  await prisma.communityMember.create({
    data: {
      user_id: data.creator_id,
      community_id: community.id,
      is_moderator: true,
    },
  });

  return community;
}

  async joinCommunity(userId: number, communityId: number) {
    
    const exists = await prisma.communityMember.findUnique({
      where: { user_id_community_id: { user_id: userId, community_id: communityId } },
    });
    if (exists) throw new Error("Ya es miembro");


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