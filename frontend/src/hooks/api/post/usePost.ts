import type { Post, PostComment, ResponseWithPagination, User } from "@/interface/global";
import type { PostCommentDTO } from "@/interface/global.dto";
import { createComment, getComments, getPostById, getReplies } from "@/services/post.api";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// usePostById (GET)
//==============================================
export const usePostById = (post_id: string) => {
  return useQuery({
    queryKey: ["post", post_id],
    queryFn: async () => {
      const response = await getPostById(post_id);
      if (!response.success || !response.data) {
        throw new Error("Error en la respuesta del post");
      }
      return response.data as Post;
    },
    enabled: !!post_id,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
};

// useComment (GET)
//==============================================
export const useComment = (post_id: string) => {
  return useInfiniteQuery<ResponseWithPagination<PostComment[]>>({
    queryKey: ["comments", post_id],

    queryFn: async ({ pageParam = 1 }) => {
      const response = await getComments(
        post_id as string,
        pageParam as number,
      );

      if (!response?.success || !response?.data) {
        throw new Error("Error en la respuesta de los comentarios");
      }

      return response as ResponseWithPagination<PostComment[]>;
    },

    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.hasMore) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,

    enabled: !!post_id,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,

    retry: 1,
  });
};

// useReplies (GET)
//==============================================
export const useReplies = (comment_id: string, enabled: boolean) => {
  return useInfiniteQuery<ResponseWithPagination<PostComment[]>>({
    queryKey: ["replies", comment_id],

    queryFn: async ({ pageParam = 1 }) => {
      const response = await getReplies(
        comment_id as string,
        pageParam as number,
      );

      if (!response?.success || !response?.data) {
        throw new Error("Error en la respuesta de las respuestas");
      }

      return response as ResponseWithPagination<PostComment[]>;
    },

    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.hasMore) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,

    enabled: !!comment_id && enabled,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,

    retry: false,
  });
};


// useCreateComment (POST)
//==============================================
export const useCreateComment = (currentUser: User) => { 
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (comment: PostCommentDTO) => await createComment(comment),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["comments", variables.post_id] });
      await queryClient.cancelQueries({ queryKey: ["post", variables.post_id] });

      const previousComments = queryClient.getQueryData(["comments", variables.post_id]);
      const previousPost = queryClient.getQueryData(["post", variables.post_id]);

      const optimisticComment = {
        id: `temp-${crypto.randomUUID()}`,
        content: variables.content,
        post_id: variables.post_id,
        parent_comment_id: variables.parent_comment_id || null,
        reply_to_user_id: variables.reply_to_user_id || null,
        created_at: new Date().toISOString(),
        votes_up: 0,
        votes_down: 0,
        active: true,
        user: {
          id: currentUser?.id,
          name: currentUser?.name || "Tú",
          slug: currentUser?.slug || "",
          avatar_url: currentUser?.avatar_url || "",
        },
        replies: [],
      };

      queryClient.setQueryData(["comments", variables.post_id], (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData;

        const newPages = oldData.pages.map((page: any, pageIndex: number) => {
          if (pageIndex !== 0) return page;

          let newCommentsArray = [...page.data];

          if (!variables.parent_comment_id) {
            newCommentsArray = [optimisticComment, ...newCommentsArray];
          } else {
            newCommentsArray = newCommentsArray.map((comment) => {
              if (comment.id === variables.parent_comment_id) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), optimisticComment],
                };
              }
              return comment;
            });
          }

          return { ...page, data: newCommentsArray };
        });

        return { ...oldData, pages: newPages };
      });

      queryClient.setQueryData(["post", variables.post_id], (oldPost: any) => {
        if (!oldPost) return oldPost;
        return {
          ...oldPost,
          data: {
            ...oldPost.data,
            total_comments: (oldPost.data.total_comments || 0) + 1,
          }
        };
      });

      return { previousComments, previousPost };
    },

    onError: (error, variables, context) => {
      console.error("Error al crear el comentario:", error);
      if (context?.previousComments) {
        queryClient.setQueryData(["comments", variables.post_id], context.previousComments);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(["post", variables.post_id], context.previousPost);
      }
    },

    onSettled: async (_, __, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["comments", variables.post_id] });
      await queryClient.invalidateQueries({ queryKey: ["post", variables.post_id] });
    },
  });
};