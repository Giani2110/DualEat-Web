import { prisma } from "../../prisma/prisma";

import { CreatePostDTO } from "../../interfaces/post.dto";
import { CreateRecipeDTO } from "../../interfaces/recipe.dto";

import { generateReadableSlug } from "../../utils/sluglify";
import { getSocketServer } from "../../config/socket.config";
import { Post, Recipe } from "@prisma/client";

export class PostService {
  constructor() {}

  private async sendPostNotification(post: Post, recipe?: Recipe) {
    if (!post.community_id) {
      return;
    }

    // 1. Obtener miembros con notificaciones ALWAYS y FREQUENT (tiempo real)
    const immediateSubscribers = await prisma.communityMember.findMany({
      where: {
        community_id: post.community_id,
        user_id: {
          not: post.user_id,
        },
        receives_notifications: {
          in: ["FREQUENT"],
        },
      },
      select: { user_id: true },
    });

    // 2. Obtener miembros con notificaciones RARE (resumen diario)
    const rareSubscribers = await prisma.communityMember.findMany({
      where: {
        community_id: post.community_id,
        user_id: {
          not: post.user_id,
        },
        receives_notifications: "RARE",
      },
      select: { user_id: true },
    });

    // 3. Crear notificaciones en BD para usuarios con notificaciones inmediatas
    if (immediateSubscribers.length > 0) {
      const immediateUserIds = immediateSubscribers.map((m) => m.user_id);

      if (recipe) {
        await prisma.notification.createMany({
          data: immediateUserIds.map((userId) => ({
            user_id: userId,
            content_type: "POST",
            content_id: recipe.id,
            message: `Nuevo post con receta publicado en la comunidad: "${post.title}.`,
            metadata: {
              communityId: post.community_id,
              postTitle: post.title,
              postMessage: post.content,
              postURLs: post.image_urls,
              slug: post.slug,
              recipeName: recipe.name,
              recipeDescription: recipe.description,
              recipeMainImage: recipe.main_image,
              recipeTotalTime: recipe.total_time,
              createdAt: post.created_at,
            },
          })),
        });
      } else {
        await prisma.notification.createMany({
          data: immediateUserIds.map((userId) => ({
            user_id: userId,
            content_type: "POST",
            content_id: post.id,
            message: `Nuevo post publicado en la comunidad: "${post.title}.`,
            metadata: {
              communityId: post.community_id,
              postTitle: post.title,
              postMessage: post.content,
              postURLs: post.image_urls,
              slug: post.slug,
            },
          })),
        });
      }

      // 4. Enviar WebSocket a usuarios conectados (tiempo real)
      try {
        const socketServer = getSocketServer();
        socketServer.to(immediateUserIds).emit("new_community_post", {
          type: "community_post",
          postId: post.id,
          communityId: post.community_id,
          title: post.title,
          message: `Nuevo post publicado en la comunidad: "${post.title}.`,
        });

        console.log(
          `[Socket] Notificación inmediata enviada a ${immediateUserIds.length} usuarios por post en comunidad ${post.community_id}.`
        );
      } catch (socketError) {
        console.error(
          "Error al enviar notificación por Socket.io:",
          socketError
        );
      }
    }

    if (rareSubscribers.length > 0) {
      console.log(
        `[Digest] ${rareSubscribers.length} usuarios RARE recibirán este post en su resumen diario.`
      );
    }
  }

  /** GET ALL POSTS */
  async getAllPosts() {
    try {
      const result = await prisma.post.findMany();
      return result;
    } catch (error) {
      throw new Error(`Error al obtener posts: ${error}`);
    }
  }

  /** GET POST (by slug) */
 async getPostBySlug(
  userSlug: string,
  communitySlug: string,
  postSlug: string,
  user_id: string
) {
  try {
    // 1. Obtener el post con comunidad, receta, autor y comentarios
    const post = await prisma.post.findFirst({
      where: {
        slug: postSlug,
        user: {
          is: { slug: userSlug },
        },
        community: {
          is: { slug: communitySlug },
        },
      },
      include: {
        community: true,
        recipe: true,
        user: true,
        comments: {
          include: {
            user: true,
            replies: true, // opcional: si querés anidar respuestas
          },
        },
      },
    });

    if (!post) return null;

    // 2. Obtener el voto del usuario sobre el post
    const postVote = await prisma.vote.findFirst({
      where: {
        user_id,
        content_id: post.id,
        content_type: "post",
      },
    });

    // 3. Obtener los votos del usuario sobre los comentarios del post
    const commentVotes = await prisma.vote.findMany({
      where: {
        user_id,
        content_type: "comment",
        content_id: {
          in: post.comments.map((c) => c.id),
        },
      },
    });

    // 4. Enriquecer los comentarios con el voto del usuario
    const enrichedComments = post.comments.map((comment) => {
      const vote = commentVotes.find((v) => v.content_id === comment.id);
      return {
        ...comment,
        userVote: vote?.vote_type ?? null,
      };
    });

    return {
      ...post,
      userVote: postVote?.vote_type ?? null,
      comments: enrichedComments,
    };
  } catch (error) {
    throw new Error(`Error al obtener el post: ${error}`);
  }
}

  /** CREATE POST */
  async createPost(postData: CreatePostDTO, recipeData?: CreateRecipeDTO) {
    const recipeModel = recipeData ? prisma.recipe : null;
    const postModel = prisma.post;
    try {
      const slugPost = await generateReadableSlug(postData.title, postModel);
      if (recipeData) {
        const slugRecipe = await generateReadableSlug(
          recipeData.name,
          recipeModel
        );
        const result = await prisma.$transaction(async (tx) => {
          const recipe = await tx.recipe.create({
            data: {
              name: recipeData.name,
              slug: slugRecipe,
              description: recipeData.description,
              main_image: recipeData.main_image,
              total_time: recipeData.total_time,
              user_id: recipeData.user_id,
              ingredients: {
                create: recipeData.ingredients,
              },
              steps: {
                create: recipeData.steps,
              },
            },
          });
          const post = await tx.post.create({
            data: {
              title: postData.title,
              slug: slugPost,
              content: postData.content,
              image_urls: postData.image_urls,
              type: postData.type,
              user_id: postData.user_id,
              community_id: postData.community_id,
              recipe_id: recipe.id,
            },
          });

          await this.sendPostNotification(result.post, result.recipe);
          return { post, recipe };
        });
        return result;
      } else {
        const post = await prisma.post.create({
          data: {
            title: postData.title,
            slug: slugPost,
            content: postData.content,
            image_urls: postData.image_urls,
            type: postData.type,
            user_id: postData.user_id,
            community_id: postData.community_id,
          },
        });
        await this.sendPostNotification(post);
        return post;
      }
    } catch (error) {
      throw new Error(`Error al crear el post: ${error}`);
    }
  }
}
