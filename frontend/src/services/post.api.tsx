import { axiosInterceptor } from "../interceptor/axios-interceptor";
import axios from "axios";
import toast from "react-hot-toast";

import { getRecipeByName } from "./recipes.api";

import type { Response } from "../interface/global";
import type { CreatePostDTO, CreateRecipeDTO } from "../interface/global.dto";

export const createPost = async (
  postData: CreatePostDTO,
  recipeData?: CreateRecipeDTO
): Promise<Response | null> => {
  try {
    const formData = new FormData();

    // ===========================
    // Validar receta duplicada (si la receta ya existe en la comunidad, con el mismo nombre, por el mismo usuario)
    // ===========================
    if (recipeData) {
      const existingRecipe = await getRecipeByName(
        recipeData.name,
        recipeData.user_id,
        postData.community_id
      );

      if (existingRecipe && existingRecipe.success === true) {
        toast.error(
          "Ya tienes una receta con ese nombre, en esta misma comunidad"
        );
        return null;
      }
    }

    
    // ===========================
    // Campos del post
    // ===========================
    formData.append("title", postData.title);
    formData.append("content", postData.content);
    formData.append("type", postData.type);
    formData.append("user_id", String(postData.user_id));
    formData.append("community_id", String(postData.community_id));

    if (postData.image_urls?.length) {
      postData.image_urls.forEach((file) => {
        formData.append("image_urls", file);
      });
    }

    // ===========================
    // Datos de receta
    // ===========================
    if (recipeData) {
      formData.append("name", recipeData.name);
      formData.append("description", recipeData.description);
      formData.append("total_time", String(recipeData.total_time || 0));
      formData.append("user_id", String(recipeData.user_id));

      if (recipeData.main_image instanceof File) {
        formData.append("main_image", recipeData.main_image);
      }

      formData.append("ingredients", JSON.stringify(recipeData.ingredients));

      recipeData.steps.forEach((step, index) => {
        formData.append(
          `steps[${index}][step_number]`,
          String(step.step_number)
        );
        formData.append(`steps[${index}][description]`, step.description);
        formData.append(
          `steps[${index}][estimated_time]`,
          String(step.estimated_time || 0)
        );

        if (step.image_url instanceof File) {
          formData.append(`steps[${index}][image]`, step.image_url);
        }
      });
    }

    // ===========================
    // Envío a backend
    // ===========================
    const response = await toast.promise(
      axiosInterceptor.post("/post/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
      {
        loading: recipeData ? "Creando post con receta..." : "Creando post...",
        success: (res) => res.data.message || "Post creado exitosamente",
        error: (err) => err.response?.data?.message || "Error al crear post",
      }
    );

    return response.data as Response;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      toast.error(err.response?.data?.message || "Error al crear post");
    } else {
      toast.error("Error inesperado");
    }
    return null;
  }
};
