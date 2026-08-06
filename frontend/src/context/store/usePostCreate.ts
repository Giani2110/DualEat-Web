import { create } from "zustand";
import type { PostDTO } from "@/interface/global.dto";

interface PostCreateState {
  post: PostDTO;

  setPost: (post: PostDTO) => void;
  clearPost: () => void;
}

const initialPost: PostDTO = {
  id: "",
  title: "",
  content: "",
  image_urls: [],
  community: null,
  recipe: null,
};

export const usePostCreateStore = create<PostCreateState>((set) => ({
  post: initialPost,
  setPost: (post: PostDTO) => set({ post }),
  clearPost: () => set({ post: initialPost }),
}));
