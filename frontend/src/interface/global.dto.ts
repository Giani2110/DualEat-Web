export interface CreatePostDTO {
  title: string;
  content: string;
  image_urls?: File[];
  type: "post" | "recipe";
  community_id: string;
}

export interface CreateRecipeDTO {
  name: string;
  description: string;
  main_image:  File | null;
  total_time?: number;
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


export type UploadableFile = {
  file: File;    
  uri: string; 
};