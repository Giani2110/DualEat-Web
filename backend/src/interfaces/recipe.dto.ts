export interface CreateRecipeDTO {
  name: string;
  description: string;
  main_image: string;
  total_time?: number;
  user_id: number;

  ingredients: {
    ingredient_id: number;
    quantity: string;
    unit_of_measure_id: number;
    notes?: string;
  }[];

  steps: {
    step_number: number;
    description: string;
    image_url?: string;
    estimated_time?: number;
  }[];
}