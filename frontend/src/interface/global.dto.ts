import { Unit, type Community, type Ingredient } from "./global";

export interface PostCommentDTO {
  post_id: string;
  parent_comment_id: string | null;
  reply_to_user_id: string | null;
  content: string;
}

export interface UploadPayload {
  post_images?: UploadableFile[]; // Imágenes o video de Post
  main_image?: UploadableFile; // Imagen principal de una receta
  image_url?: UploadableFile; // Ícono de una comunidad
  banner_url?: UploadableFile; // Banner de una comunidad
}

export interface CommunityDTO {
  name: string;
  description: string;
  image_url: UploadableFile | string; // String en caso de dejar una URL por defecto
  banner_url: UploadableFile | string; // String en caso de dejar una URL por defecto

  tags: string[];
}

export interface PostDTO {
  id?: string;
  title: string;
  content: string;
  image_urls: string[] | UploadableFile[];
  community: Community | null;
}

export interface RecipeDTO {
  name: string;
  description: string;
  total_time?: number;
  main_image: UploadableFile | string;

  ingredients: RecipeIngredientDTO[];
  steps: RecipeStepDTO[];
}

export interface RecipeStepDTO {
  step_number: number;
  description: string;
  estimated_time: number | null;
}

export interface RecipeIngredientDTO {
  ingredient: Ingredient | null;
  quantity: string;
  unit: Unit;
  notes?: string;
}

export type UploadableFile = {
  file: File;
  uri: string;
};
