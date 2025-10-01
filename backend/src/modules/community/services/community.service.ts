import { prisma } from "../../../prisma/prisma";
import { Prisma } from "@prisma/client";
import { CreateCommunityDTO } from "../../../interfaces/community.dto";

import { generateUniqueSlug } from "../../../utils/sluglify";

export class CommunityService {
  constructor() {}

  /** CREATE COMMUNITY */
  async createCommunity(data: CreateCommunityDTO) {
    const communityModel = prisma.community;
    try {
      console.log(
        "Intentando crear comunidad con creator_id:",
        data.creator_id
      );
      const slug = await generateUniqueSlug(data.name, communityModel);
      const result = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const community = await tx.community.create({
            data: {
              name: data.name,
              slug: slug,
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
        }
      );
      return result;
    } catch (error) {
      throw new Error(`Error al crear comunidad: ${error}`);
    }
  }

  /** JOIN COMMUNITY */
  async joinCommunity(user_id: string, community_id: string) {
    try {
      const result = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
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
        }
      );

      return result;
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  /** LEAVE COMMUNITY */
  async leaveCommunity(user_id: string, community_id: string) {
    console.log("Intentando abandonar comunidad con user_id:", user_id, "y community_id:", community_id);
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const exists = await tx.communityMember.findUnique({
          where: {
            user_id_community_id: {
              user_id: user_id,
              community_id: community_id,
            },
          },
        });
        if (!exists) throw new Error("No es miembro");

        await tx.communityMember.delete({
          where: {
            user_id_community_id: {
              user_id: user_id,
              community_id: community_id,
            },
          },
        });

        await tx.community.update({
          where: { id: community_id },
          data: { total_members: { decrement: 1 } },
        });

        return exists;
      }
    );

    return result;
  }

  /** EXPLORE COMMUNITIES */
  async getRecommendedCommunities(user_id: string) {
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
        .map((preference: any) => preference.community_tag_id)
        .filter((id: number): id is number => id !== null);

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

  /** GET COMMUNITY (by slug) */
  async getCommunity(slug: string, user_id?: string) {
    try {
      const community = await prisma.community.findUnique({
        where: { slug },
        include: { tags: true },
      });

      if (!community) {
        throw new Error("Comunidad no encontrada");
      }

      let isMember = false;
      let receives_notifications: string | null = null;

      if (user_id) {
        const member = await prisma.communityMember.findFirst({
          where: {
            community_id: community.id,
            user_id,
          },
          select: {
            receives_notifications: true,
          },
        });

        if (member) {
          isMember = true;
          receives_notifications = member.receives_notifications;
        }
      }

      return {
        ...community,
        isMember,
        receives_notifications,
      };
    } catch (error) {
      throw new Error(`Error al obtener comunidad: ${error}`);
    }
  }

  /** GET COMMUNITY POSTS */
  async getCommunityPosts(community_id: string, page: number, user_id: string) {
    try {
      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where: { community_id, active: true },
          orderBy: { created_at: "desc" },
          skip: (page - 1) * 10,
          take: 10,
          include: {
            community: { select: { slug: true } },
            user: { select: { id: true, name: true, avatar_url: true, slug: true } },
          },
        }),
        prisma.post.count({ where: { community_id, active: true } }),
      ]);

      // Obtener votos del usuario
      const votes = await prisma.vote.findMany({
        where: {
          user_id: user_id,
          content_type: "post",
          content_id: {
            in: posts.map((post) => post.id),
          },
        },
        select: {
          vote_type: true,
          content_id: true,
        },
      });

      // Crear mapa de votos para acceso rápido
      const voteMap = new Map(
        votes.map((vote) => [vote.content_id, vote.vote_type])
      );

      // Combinar posts con información de votos
      const postsWithVotes = posts.map((post) => ({
        ...post,
        userVote: voteMap.get(post.id) || null,
        hasVoted: voteMap.has(post.id),
      }));

      const totalPages = Math.ceil(total / 10);

      return {
        data: postsWithVotes,
        pagination: {
          page,
          totalPages,
          total,
          hasMore: page < totalPages,
        },
      };
    } catch (error) {
      throw new Error(`Error al obtener posts: ${error}`);
    }
  }

  async getUserCommunities(user_id: string) {
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
