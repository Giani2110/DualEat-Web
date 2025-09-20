export interface CreatePostDTO {
  title: string;
  content: string;
  image_urls?: File[];
  type: "post" | "recipe";
  user_id: number;
  community_id: number;
}

export interface CreateRecipeDTO {
  name: string;
  description: string;
  main_image:  File | null;
  total_time?: number;
  user_id: number;
  ingredients: {
    ingredient_id: string;
    quantity: string;
    unit_of_measure_id: string;
    notes?: string;
  }[];
  steps: {
    step_number: string;
    description: string;
    image_url?: File | string;
    estimated_time?: string;
  }[];
}
