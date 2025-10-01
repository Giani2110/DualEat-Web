export interface CreateRecipeDTO {
  name: string;
  description: string;
  main_image: string;
  total_time?: number;
  user_id: string;

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


export interface AskAI {
  type: string;
  question: string;
  ingredients?: number[];
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}