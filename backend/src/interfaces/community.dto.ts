export interface CreateCommunityDTO {
  name: string;
  description: string;
  image_url?: string;
  theme_color?: string;
  visibility: "public" | "private" | "restricted"; 
  creator_id: number;
  selectedTags: number[]; 
}