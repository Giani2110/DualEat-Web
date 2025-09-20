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