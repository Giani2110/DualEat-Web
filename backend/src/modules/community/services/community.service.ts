import { prisma } from "../../../prisma/prisma";
import { CreateCommunityDTO } from "../../../interfaces/community.dto";

export class CommunityService {
  constructor() {}

  /** CREATE COMMUNITY */
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
          include: { tags: true },
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

  /** JOIN COMMUNITY */
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

  /** LEAVE COMMUNITY */
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

  /** EXPLORE COMMUNITIES */
  async getRecommendedCommunities(user_id: number) {
    try {
      const userCommunityPreferences = await prisma.userPreference.findMany({
        where: {
          user_id: user_id,
          community_tag_id: {
            not: null,
          },
        },
        select: {
          community_tag_id: true,
        },
      });

      const preferredTagIds = userCommunityPreferences
        .map((preference) => preference.community_tag_id)
        .filter((id): id is number => id !== null);

      // Check if the user has any community preferences
      if (preferredTagIds.length > 0) {
        // Logic for users with preferences (personalized recommendations)
        const result = await prisma.community.findMany({
          where: {
            active: true,
            tags: {
              some: {
                id: {
                  in: preferredTagIds,
                },
              },
            },
            members: {
              none: {
                user_id: user_id,
              },
            },
          },
          include: { tags: true },
          // You can also order by some relevance score here
          take: 20,
        });

        return result;
      } else {
        // Fallback logic for users with no preferences
        // Get the most popular communities overall
        const popularCommunities = await prisma.community.findMany({
          where: {
            active: true,
            members: {
              none: {
                user_id: user_id,
              },
            },
          },
          include: { tags: true },
          take: 20,
        });

        return popularCommunities;
      }
    } catch (error) {
      throw new Error(`Error al obtener comunidades recomendadas: ${error}`);
    }
  }

  async getPopularCommunities() {
    try {
      const result = await prisma.community.findMany({
        where: { active: true },
        orderBy: { total_members: "desc" },
        take: 20,
        include: {
          tags: true,
          members: true,
        },
      });
      return result;
    } catch (error) {
      throw new Error(`Error al obtener comunidades populares: ${error}`);
    }
  }

  async getTrendingCommunities() {
    const trendingCommunities = await prisma.community.findMany({
      where: {
        active: true,
        posts: {
          some: {
            created_at: {
              gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), 
            },
            votes_up: { gte: 10 },
            total_comments: { gte: 5 },
          },
        },
      },
      orderBy: {
        updated_at: "desc",
      },
      take: 10,
      include: {
        tags: true,
        posts: true,
      },
    });

    return trendingCommunities;
  }

  async getAllCommunities(take: boolean) {
    try {
      const result = await prisma.community.findMany({
        include: { tags: true },
        take: take ? 20 : undefined,
        orderBy: { total_members: "desc" },
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

  async getCommunitiesByTag(tagId: number) {
    try {
      const communities = await prisma.community.findMany({
        where: {
          tags: {
            some: {
              category: {
                is: {
                  id: tagId,
                },
              },
            },
          },
        },
        include: { tags: true },
      });

      return communities;
    } catch (error) {
      console.error("Error fetching communities by tag:", error);
      // You should re-throw the error or return a consistent error object.
      throw new Error("Failed to fetch communities by tag.");
    }
  }
}
