import { prisma } from "../prisma/prisma";
import { CreateCommunityDTO } from "../interfaces/community.dto";
import tr from "zod/v4/locales/tr.cjs";
import { ca } from "zod/v4/locales/index.cjs";

export class CommunityService {
  constructor() {}

  async createCommunity(data: CreateCommunityDTO) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const community = await tx.community.create({
          data: {
            name: data.name,
            description: data.description,
            image_url: data.image_url,
            theme_color: data.theme_color,
            visibility: data.visibility,
            creator_id: data.creator_id,
            total_members: 1,
            tags: {
              connect: data.selectedTags.map((id) => ({ id })),
            },
          },
        });

        await tx.communityMember.create({
          data: {
            user_id: data.creator_id,
            community_id: community.id,
            is_moderator: true,
          },
        });
        return community;
      });
      return result;
    } catch (error) {
      throw new Error(`Error al crear comunidad: ${error}`);
    }
  }

  async getAllCommunities() {
    try {
      const result = await prisma.community.findMany({
        include: { tags: true },
      });
      return result;
    } catch (error) {
      throw new Error(`Error al obtener todas las comunidades: ${error}`);
    }
  }

  async getCommunity(name: string) {
    try {
      const result = await prisma.community.findUnique({
        where: { name: name },
      });
      return result;
    } catch (error) {
      throw new Error(`Error al obtener comunidad: ${error}`);
    }
  }

  async joinCommunity(user_id: number, community_id: number) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const exists = await tx.communityMember.findUnique({
          where: {
            user_id_community_id: { user_id, community_id },
          },
        });

        if (exists) {
          throw new Error("Ya perteneces a la comunidad");
        } else {
          const member = await tx.communityMember.create({
            data: { user_id, community_id },
          });

          await tx.community.update({
            where: { id: community_id },
            data: { total_members: { increment: 1 } },
          });

          return member;
        }
      });

      return result;
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  async leaveCommunity(userId: number, communityId: number) {
    // verificar que sea miembro
    const exists = await prisma.communityMember.findUnique({
      where: {
        user_id_community_id: { user_id: userId, community_id: communityId },
      },
    });
    if (!exists) throw new Error("No es miembro");

    // borrar miembro y decrementar contador
    await prisma.communityMember.delete({
      where: {
        user_id_community_id: { user_id: userId, community_id: communityId },
      },
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

  async getUserCommunities(user_id: number) {
    try {
      const result = await prisma.communityMember.findMany({
        where: { user_id },
        include: { community: true },
      });
      return result;
    } catch (error) {
      throw new Error(`Error al obtener comunidades del usuario: ${error}`);
    }
  }
}
