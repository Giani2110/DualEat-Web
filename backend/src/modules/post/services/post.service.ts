import { prisma } from "../../../prisma/prisma";

import { CreatePostDTO } from "../../../interfaces/post.dto";
import { CreateRecipeDTO } from "../../../interfaces/recipe.dto";

export class PostService {
  constructor() {}

  /** GET ALL POSTS */
  async getAllPosts() {
    try {
      const result = await prisma.post.findMany();
      return result;
    } catch (error) {
      throw new Error(`Error al obtener posts: ${error}`);
    }
  }

  /** GET POST BY ID */
  async getPostById(postId: number) {
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: { comments: true, recipe: true },
      });
      return post;
    } catch (error) {
      throw new Error(`Error al obtener el post: ${error}`);
    }
  }

  /** CREATE POST */
  async createPost(postData: CreatePostDTO, recipeData?: CreateRecipeDTO) {
    try {
      if (recipeData) {
        const result = await prisma.$transaction(async (tx) => {
          const post = await tx.post.create({
            data: {
                title: postData.title,
                content: postData.content,
                image_urls: postData.image_urls,
                type: postData.type,
                user_id: postData.user_id,
                community_id: postData.community_id,
            },
          });
            const recipe = await tx.recipe.create({
              data: {
                name: recipeData.name,
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
          return { post, recipe };
        });
        return result;
      } else {
        const post = await prisma.post.create({
          data: {
            title: postData.title,
            content: postData.content,
            image_urls: postData.image_urls,
            type: postData.type,
            user_id: postData.user_id,
            community_id: postData.community_id,
          },
        });
        return post;
      }
    } catch (error) {
      throw new Error(`Error al crear el post: ${error}`);
    }
  }
}
