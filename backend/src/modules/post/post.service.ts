import { prisma } from "../../prisma/prisma";

import { CreatePostDTO } from "../../interfaces/post.dto";
import { CreateRecipeDTO } from "../../interfaces/recipe.dto";

import { generateReadableSlug } from "../../utils/sluglify";
import { getSocketServer } from "../../config/socket.config";
import { Post, Recipe, Community } from "@prisma/client";

export class PostService {
  constructor() {}

  private async sendPostNotification(post: Post & { community?: Community | null }, recipe?: Recipe) {
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
            message: `Nuevo post con receta publicado en la comunidad: "${post.title}".`,
            metadata: {
              title: post.title,
              message: post.content,
              type: "post",
              imageURLs: {
                community: post.community?.image_url || "",
                post: recipe.main_image || "",
              },
              slugs: {
                community: post.community?.slug || "",
              },
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
              title: post.title,
              message: post.content,
              type: "post",
              imageURLs: {
                community: post.community?.image_url || "",
                post: post.image_urls?.[0] || "",
              },
              slugs: {
                community: post.community?.slug || "",
              },
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

  private async sendCommentNotification(
    post_id: string,
    user_id: string,
    content: string,
    parent_comment_id?: string | null
  ) {
    try {
      let recipientUserId: string | null = null;
      let title = "";
      let message = "";

      // Obtener datos del usuario que comentó
      const commenter = await prisma.user.findUnique({
        where: { id: user_id },
        select: {
          name: true,
          avatar_url: true,
          slug: true,
        },
      });

      // Obtener datos del post completo
      const post = await prisma.post.findUnique({
        where: { id: post_id },
        include: {
          user: { select: { slug: true } },
          community: { select: { slug: true } },
        },
      });

      if (!post) return;

      title = post.title;

      if (parent_comment_id) {
        // Es una respuesta a otro comentario
        const parentComment = await prisma.postComment.findUnique({
          where: { id: parent_comment_id },
          select: { user_id: true },
        });

        if (parentComment && parentComment.user_id !== user_id) {
          recipientUserId = parentComment.user_id;
          message = commenter
            ? `${commenter.name} respondió a tu comentario en "${title}".`
            : `Alguien respondió a tu comentario en "${title}".`;
        }
      } else {
        // Es un comentario directo al post
        if (post.user_id !== user_id) {
          recipientUserId = post.user_id;
          message = commenter
            ? `${commenter.name} comentó en tu post: "${title}".`
            : `Alguien comentó en tu post: "${title}".`;
        }
      }

      if (recipientUserId) {
        await prisma.notification.create({
          data: {
            user_id: recipientUserId,
            content_type: "COMMENT",
            content_id: post_id,
            message,
            metadata: {
              title,
              message: content,
              type: "comment",
              imageURLs: {
                user: commenter?.avatar_url
              },
              slugs: {
                community: post.community.slug,
                user: post.user.slug,
                post: post.slug,
              },
            },
          },
        });

        // Enviar por WebSocket si está conectado
        try {
          const socketServer = getSocketServer();
          socketServer.to(recipientUserId).emit("new_comment", {
            type: "comment_notification",
            postId: post_id,
            parentCommentId: parent_comment_id || null,
            message,
            metadata: {
              title,
              message: content,
              type: "comment",
              imageURLs: {
                user: commenter?.avatar_url
              },
              slugs: {
                community: post.community.slug,
                user: post.user.slug,
                post: post.slug,
              },
            },
          });

          console.log(
            `[Socket] Notificación de comentario enviada a ${recipientUserId}`
          );
        } catch (socketError) {
          console.error(
            "Error al enviar notificación por Socket.io:",
            socketError
          );
        }
      }
    } catch (error) {
      console.error("Error al enviar notificación de comentario:", error);
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
    user_id: string,
    sortBy: number
  ) {
    try {
      // 1-4. [Código anterior sin cambios hasta allComments]
      const post = await prisma.post.findFirst({
        where: {
          slug: postSlug,
          user: { is: { slug: userSlug } },
          community: { is: { slug: communitySlug } },
        },
        include: {
          community: true,
          recipe: true,
          user: {
            select: {
              id: true,
              name: true,
              slug: true,
              avatar_url: true,
            },
          },
        },
      });

      if (!post) return null;

      const allComments = await prisma.postComment.findMany({
        where: {
          post_id: post.id,
          active: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              slug: true,
              avatar_url: true,
            },
          },
        },
        orderBy: {
          created_at: "asc",
        },
      });

      const postVote = await prisma.vote.findFirst({
        where: {
          user_id,
          content_id: post.id,
          content_type: "post",
        },
      });

      const commentVotes = await prisma.vote.findMany({
        where: {
          user_id,
          content_type: "comment",
          content_id: {
            in: allComments.map((c) => c.id),
          },
        },
      });

      // 5. Tipo para el comentario enriquecido
      type EnrichedComment = (typeof allComments)[0] & {
        userVote: string | null;
        replies: EnrichedComment[];
        totalReplies?: number; // Para el filtro controversial
      };

      // 6. Construir el árbol
      const commentMap = new Map<string, EnrichedComment>();
      const rootComments: EnrichedComment[] = [];

      allComments.forEach((comment) => {
        const vote = commentVotes.find((v) => v.content_id === comment.id);
        commentMap.set(comment.id, {
          ...comment,
          userVote: vote?.vote_type ?? null,
          replies: [],
        });
      });

      allComments.forEach((comment) => {
        const commentWithReplies = commentMap.get(comment.id)!;

        if (comment.parent_comment_id) {
          const parent = commentMap.get(comment.parent_comment_id);
          if (parent) {
            parent.replies.push(commentWithReplies);
          }
        } else {
          rootComments.push(commentWithReplies);
        }
      });

      // 7. Función recursiva para contar todas las replies
      const countAllReplies = (comment: EnrichedComment): number => {
        let count = comment.replies.length;
        comment.replies.forEach((reply) => {
          count += countAllReplies(reply);
        });
        return count;
      };

      // 8. Agregar el conteo de replies a cada comentario
      rootComments.forEach((comment) => {
        comment.totalReplies = countAllReplies(comment);
      });

      // 9. Ordenar según el filtro
      const sortedComments = [...rootComments].sort((a, b) => {
        switch (sortBy) {
          case 1:
            // Más votados (votes_up - votes_down)
            const scoreA = a.votes_up - a.votes_down;
            const scoreB = b.votes_up - b.votes_down;
            return scoreB - scoreA;

          case 2:
            // Más recientes primero
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );

          case 3:
            // Más antiguos primero
            return (
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
            );

          case 4:
            // Más polémicos (más replies totales)
            return (b.totalReplies || 0) - (a.totalReplies || 0);

          default:
            return 0;
        }
      });

      return {
        ...post,
        userVote: postVote?.vote_type ?? null,
        comments: sortedComments,
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
            include: {
              community: true,
            }
          });
          await this.sendPostNotification(post, recipe);
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
          include: {
            community: true,
          },
        });
        await this.sendPostNotification(post);
        return post;
      }
    } catch (error) {
      throw new Error(`Error al crear el post: ${error}`);
    }
  }

  /** CREATE COMMENT */
  async createComment(
    post_id: string,
    user_id: string,
    content: string,
    parent_comment_id?: string | null
  ) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const comment = await tx.postComment.create({
          data: {
            content,
            post_id,
            user_id,
            parent_comment_id,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                slug: true,
                avatar_url: true,
              },
            },
            replies: true,
          },
        });

        await tx.post.update({
          where: { id: post_id },
          data: {
            total_comments: {
              increment: 1,
            },
          },
        });

        return comment;
      });

      if (result) {
        await this.sendCommentNotification(
          post_id,
          user_id,
          content,
          parent_comment_id
        );
      }

      return result;
    } catch (error) {
      console.error("Error al crear comentario:", error);
      throw new Error("No se pudo crear el comentario");
    }
  }
}
