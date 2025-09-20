export interface CreatePostDTO {
    title: string;
    content: string;
    image_urls?: string[];
    type: "post" | "recipe";
    user_id: number;
    community_id: number;
}