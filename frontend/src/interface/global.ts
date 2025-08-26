export interface Response {
  success: boolean;
  message: string;
}

export interface Category {
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
  category: Category;
}
