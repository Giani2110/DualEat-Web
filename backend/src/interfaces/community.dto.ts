export interface CreateCommunityDTO {
  name: string;
  slug?: string;
  description: string;
  image_url?: string;
  theme_color?: string;
  visibility: "public" | "private"; 
  creator_id: string;
  selectedTags: number[]; 
}