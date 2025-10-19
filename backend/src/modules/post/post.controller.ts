import { Request, Response } from "express";

import { PostService } from "./post.service";

import { uploadAndGetUrl, deleteSupabaseFiles } from "../../config/supabase";

import { CreateRecipeDTO } from "../../interfaces/recipe.dto";
import { CreatePostDTO } from "../../interfaces/post.dto";

export class PostController {
  constructor(private postService: PostService) {}

  /** GET ALL POSTS */
  async getAll(req: Request, res: Response) {
    try {
      const posts = await this.postService.getAllPosts();
      res.status(200).json({ success: true, data: posts });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  /** GET POST (by slug)*/
  async getBySlug(req: Request, res: Response) {
    const { communitySlug, postSlug, userSlug, sortBy } = req.query;
    const user_id = (req as any).user?.id;

    if (!communitySlug || !postSlug || !userSlug) {
      return res
        .status(400)
        .json({ success: false, error: "Slugs no encontrados" });
    }

    try {
      const post = await this.postService.getPostBySlug(
        String(userSlug),
        String(communitySlug),
        String(postSlug),
        user_id,
        Number(sortBy)
      );
      if (!post) {
        return res
          .status(404)
          .json({ success: false, error: "Post not found" });
      }
      res.status(200).json({ success: true, data: post });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  /** CREATE POST */
  async create(req: Request, res: Response) {
    try {
      let {
        title,
        content,
        type,
        community_id,
        name,
        description,
        total_time,
        ingredients,
        steps,
      } = req.body;

      const user_id = (req as any).user?.id;

      // Parse JSONs
      if (ingredients && typeof ingredients === "string") {
        ingredients = JSON.parse(ingredients);
      }
      if (steps && typeof steps === "string") {
        steps = JSON.parse(steps);
      }

      const files = (req.files as Express.Multer.File[]) || [];

      // ============================
      // Subir imágenes del post
      // ============================
      const imageFiles = files.filter((f) => f.fieldname === "image_urls");
      let imageUrls: string[] = [];

      if (imageFiles.length > 0) {
        try {
          imageUrls = (await uploadAndGetUrl(
            imageFiles,
            "posts",
            ""
          )) as string[];
        } catch (error) {
          console.error("Error subiendo imágenes del post:", error);
        }
      }

      // ============================
      // Subir imagen principal receta
      // ============================
      let mainImageUrl: string | null = null;
      const mainFile = files.find((f) => f.fieldname === "main_image");
      if (mainFile) {
        try {
          mainImageUrl = (await uploadAndGetUrl(
            mainFile,
            "recipes",
            "recipe_main"
          )) as string;
        } catch (error) {
          console.error("Error subiendo imagen principal:", error);
        }
      }

      // ============================
      // Subir imágenes de los pasos
      // ============================
      if (steps && Array.isArray(steps)) {
        for (let i = 0; i < steps.length; i++) {
          const stepFile = files.find(
            (f) => f.fieldname === `steps[${i}][image]`
          );
          if (stepFile) {
            try {
              steps[i].image_url = (await uploadAndGetUrl(
                stepFile,
                "recipes",
                "steps"
              )) as string;
            } catch (error) {
              console.error(`Error subiendo imagen del paso ${i + 1}:`, error);
              steps[i].image_url = null;
            }
          }
        }
      }

      // ============================
      // Armar objetos finales
      // ============================
      const postData: CreatePostDTO = {
        title,
        content,
        image_urls: imageUrls,
        type,
        user_id: user_id,
        community_id: community_id,
      };

      const parsedSteps = steps?.map((step: any) => ({
        step_number: parseInt(step.step_number, 10),
        description: step.description,
        image_url: step.image_url || null,
        estimated_time: parseInt(step.estimated_time, 10),
      }));

      const parsedIngredients = ingredients?.map((ingredient: any) => ({
        ingredient_id: parseInt(ingredient.ingredient_id, 10),
        quantity: ingredient.quantity,
        unit_of_measure_id: parseInt(ingredient.unit_of_measure_id, 10),
        notes: ingredient.notes,
      }));

      const recipeData: CreateRecipeDTO | undefined = name
        ? {
            name,
            description,
            main_image: mainImageUrl || "",
            total_time: parseInt(total_time, 10) || 0,
            user_id: user_id,
            ingredients: parsedIngredients,
            steps: parsedSteps,
          }
        : undefined;

      // ============================
      // Guardar en DB
      // ============================
      const result = await this.postService.createPost(postData, recipeData);

      if (!result) {
        try {
          await deleteSupabaseFiles(imageUrls, "posts");
          if (mainImageUrl)
            await deleteSupabaseFiles([mainImageUrl], "recipes");

          const stepImageUrls = parsedSteps
            ?.map((s: any) => s.image_url)
            .filter((url: string): url is string => !!url);
          if (stepImageUrls && stepImageUrls.length > 0) {
            await deleteSupabaseFiles(stepImageUrls, "recipes");
          }
        } catch (rollbackError) {
          console.error("Error durante rollback de imágenes:", rollbackError);
        }

        return res.status(500).json({
          success: false,
          message: "Error al crear el post",
        });
      }
      return res.status(201).json({
        success: true,
        data: result,
        message: recipeData
          ? "Post y receta creados exitosamente"
          : "Post creado exitosamente",
      });
    } catch (error: any) {
      console.error("Error en create post:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error interno del servidor",
      });
    }
  }

  /** CREATE COMMENT */
  async createComment(req: Request, res: Response) {
    try {
      const { post_id, content, parent_comment_id } = req.body;
      const user_id = (req as any).user?.id;

      if (!post_id || !content) {
        return res
          .status(400)
          .json({ success: false, message: "Faltan campos obligatorios" });
      }

      const comment = await this.postService.createComment(
        post_id,
        user_id,
        content,
        parent_comment_id
      );
      return res.status(201).json({ success: true, data: comment });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, error: (error as Error).message });
    }
  }
}
