import { create } from 'zustand';
import type { PostDTO } from '@/interface/global.dto';

interface PostCreateState {
  post: PostDTO;
  setPost: (post: PostDTO) => void;
  clearPost: () => void;
}

export const usePostCreateStore = create<PostCreateState>((set: any) => ({
  post: {
    id: "",
    title: "",
    content: "",
    image_urls: [],
    community: null,
  },
  setPost: (post: PostDTO) => set({ post }),
  clearPost: () => set({ post: { id: "", title: "", content: "", image_urls: [], community: null } }),
}));