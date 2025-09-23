export interface Response<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}
export interface CategoryTag {
  id: number;
  name: string;
  description?: string | null;
  icon_url?: string;
}

export interface CommunityTag {
  id: number;
  active: boolean;
  category_id: number;
  name: string;
  category: CategoryTag;
}

export interface Community {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  theme_color: string | null;
  visibility: string | null;
  creator_id: number;
  total_members: number;
  tags: CommunityTag[];
}

export interface Ingredient {
  id: number;
  name: string;
  description: string | null;
}

export interface UnitOfMeasure {
  id: number;
  name: string;
  abbreviation: string | null;
}

export interface Recipe {
  id: number;
  user_id: number;
  name: string;
  description: string;
  total_time: number;
  main_image: string;
  created_at: string;
  updated_at: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}

export interface RecipeIngredient {
  id: number;
  recipe_id: number;
  ingredient_id: number;
  quantity: string;
  unit_of_measure_id: number;
  notes: string;
}

export interface RecipeStep {
  id: number;
  recipe_id: number;
  step_number: number;
  description: string;
  image_url: string | null;
  estimated_time: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SearchResponse {
  success: boolean;
  data: Recipe[];
  pagination: PaginationInfo;
  comment: string;
}