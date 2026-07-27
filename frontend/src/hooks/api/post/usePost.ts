import type {
  Post,
  PostComment,
  ResponseWithPagination,
  User,
} from "@/interface/global";
import type { PostCommentDTO } from "@/interface/global.dto";
import {
  createComment,
  deleteComment,
  deletePost,
  getComments,
  getPostById,
  getReplies,
  updateComment,
} from "@/services/post.api";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";


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
export const useCreateComment = (user: User) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      variables,
    }: {
      variables: PostCommentDTO;
      reply_to_user: User | null;
    }) => {
      const response = await createComment(variables);
      if (!response.success) {
        throw new Error(response.message || "Error al crear el comentario");
      }
      return response;
    },
    onMutate: async ({ variables, reply_to_user }) => {
      const { post_id, parent_comment_id } = variables;

      const cancelPromises = [
        queryClient.cancelQueries({ queryKey: ["comments", post_id] }),
        queryClient.cancelQueries({ queryKey: ["post", post_id] }),
      ];

      if (parent_comment_id) {
        cancelPromises.push(
          queryClient.cancelQueries({
            queryKey: ["replies", parent_comment_id],
          }),
        );
      }

      await Promise.all(cancelPromises);

      const previousComments = queryClient.getQueryData(["comments", post_id]);
      const previousPost = queryClient.getQueryData(["post", post_id]);
      const previousReplies = parent_comment_id
        ? queryClient.getQueryData(["replies", parent_comment_id])
        : null;

      const optimisticComment: Partial<PostComment> = {
        id: crypto.randomUUID(),
        user: user,
        user_id: user.id,

        reply_to_user: reply_to_user || null,
        reply_to_user_id: reply_to_user?.id || null,

        content: variables.content,

        votes_up: 0,
        votes_down: 0,
        total_comments: 0,

        created_at: new Date(),
        updated_at: new Date(),
        active: true,

        user_vote: null,
        has_voted: false,

        replies: [],
      };

      // 1. Update comments query data
      queryClient.setQueryData(["comments", post_id], (oldData: any) => {
        if (!oldData?.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any, pageIndex: number) => {
            if (!parent_comment_id) {
              return pageIndex === 0
                ? { ...page, data: [optimisticComment, ...page.data] }
                : page;
            }
            const updatedData = page.data.map((c: PostComment) =>
              c.id === parent_comment_id
                ? { ...c, replies: [...(c.replies || []), optimisticComment] }
                : c,
            );
            return { ...page, data: updatedData };
          }),
        };
      });

      // 2. Update replies query data for the parent comment
      if (parent_comment_id) {
        queryClient.setQueryData(
          ["replies", parent_comment_id],
          (oldData: any) => {
            if (!oldData?.pages) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page: any, pageIndex: number) => {
                if (pageIndex === oldData.pages.length - 1) {
                  return { ...page, data: [...page.data, optimisticComment] };
                }
                return page;
              }),
            };
          },
        );
      }

      // 3. Update post total comments
      queryClient.setQueryData(["post", post_id], (oldPost: any) => {
        if (!oldPost) return oldPost;
        return {
          ...oldPost,
          total_comments: (oldPost.total_comments || 0) + 1,
        };
      });

      return {
        previousComments,
        previousPost,
        previousReplies,
        parent_comment_id,
      };
    },
    onError: (error, { variables }, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          ["comments", variables.post_id],
          context.previousComments,
        );
      }
      if (context?.previousPost) {
        queryClient.setQueryData(
          ["post", variables.post_id],
          context.previousPost,
        );
      }
      if (context?.parent_comment_id && context?.previousReplies) {
        queryClient.setQueryData(
          ["replies", context.parent_comment_id],
          context.previousReplies,
        );
      }
    },
    onSettled: async (_, __, { variables }) => {
      const invalidatePromises = [
        queryClient.invalidateQueries({
          queryKey: ["comments", variables.post_id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["post", variables.post_id],
        }),
      ];
      if (variables.parent_comment_id) {
        invalidatePromises.push(
          queryClient.invalidateQueries({
            queryKey: ["replies", variables.parent_comment_id],
          }),
        );
      }
      await Promise.all(invalidatePromises);
    },
  });
};

// useDeleteComment (DELETE)
//==============================================
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ comment_id }: { comment_id: string }) => {
      const response = await deleteComment(comment_id);
      if (!response.success) {
        throw new Error(response.message || "Error al eliminar el comentario");
      }
      return response;
    },

    onMutate: async () => {
      const cancelPromises = [
        queryClient.cancelQueries({ queryKey: ["comments"] }),
        queryClient.cancelQueries({ queryKey: ["replies"] }),
      ];
      await Promise.all(cancelPromises);

      const previousComments = queryClient.getQueryData(["comments"]);
      const previousReplies = queryClient.getQueryData(["replies"]);

      return {
        previousComments,
        previousReplies,
      };
    },
    onError: (error, _, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(["comments"], context.previousComments);
      }
      if (context?.previousReplies) {
        queryClient.setQueryData(["replies"], context.previousReplies);
      }
    },
    onSettled: async () => {
      const invalidatePromises = [
        queryClient.invalidateQueries({ queryKey: ["comments"] }),
        queryClient.invalidateQueries({ queryKey: ["replies"] }),
      ];
      await Promise.all(invalidatePromises);
    },
  });
};

// useUpdateComment (PATCH)
//==============================================
export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ comment_id, content }: { comment_id: string, content: string }) => {
      const response = await updateComment(comment_id, content);
      if (!response.success) {
        throw new Error(response.message || "Error al actualizar el comentario");
      }
      return response;
    },

    onMutate: async () => {
      const cancelPromises = [
        queryClient.cancelQueries({ queryKey: ["comments"] }),
        queryClient.cancelQueries({ queryKey: ["replies"] }),
      ];
      await Promise.all(cancelPromises);

      const previousComments = queryClient.getQueryData(["comments"]);
      const previousReplies = queryClient.getQueryData(["replies"]);

      return {
        previousComments,
        previousReplies,
      };
    },
    onError: (error, _, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(["comments"], context.previousComments);
      }
      if (context?.previousReplies) {
        queryClient.setQueryData(["replies"], context.previousReplies);
      }
    },
    onSettled: async () => {
      const invalidatePromises = [
        queryClient.invalidateQueries({ queryKey: ["comments"] }),
        queryClient.invalidateQueries({ queryKey: ["replies"] }),
      ];
      await Promise.all(invalidatePromises);
    },
  });
};

// useDeletePost (DELETE)
// ==============================================
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      post_id,
    }: {
      post_id: string;
      community_id?: string;
    }) => {
      const response = await deletePost(post_id);
      if (!response.success) {
        throw new Error(response.message || "Error al eliminar el post");
      }
      return response;
    },

    onMutate: async ({ post_id, community_id }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      if (community_id) {
        await queryClient.cancelQueries({ queryKey: ["posts", community_id] });
      }
      await queryClient.cancelQueries({ queryKey: ["post", post_id] });

      const previousGlobalPosts = queryClient.getQueryData(["posts"]);
      const previousCommunityPosts = community_id
        ? queryClient.getQueryData(["posts", community_id])
        : null;
      const previousPostDetail = queryClient.getQueryData(["post", post_id]);

      const removePostFromInfiniteQuery = (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data
              ? page.data.filter((p: Post) => p.id !== post_id)
              : [],
          })),
        };
      };

      queryClient.setQueryData(["posts"], removePostFromInfiniteQuery);

      if (community_id) {
        queryClient.setQueryData(
          ["posts", community_id],
          removePostFromInfiniteQuery,
        );
      }

      queryClient.setQueryData(["post", post_id], null);

      return {
        previousGlobalPosts,
        previousCommunityPosts,
        previousPostDetail,
        community_id,
        post_id,
      };
    },

    onError: (err, variables, context) => {
      console.error("Error al eliminar post, aplicando rollback:", err);
      if (context) {
        queryClient.setQueryData(["posts"], context.previousGlobalPosts);
        if (context.community_id && context.previousCommunityPosts) {
          queryClient.setQueryData(
            ["posts", context.community_id],
            context.previousCommunityPosts,
          );
        }
        if (context.previousPostDetail) {
          queryClient.setQueryData(
            ["post", context.post_id],
            context.previousPostDetail,
          );
        }
      }
    },
  });
};

// useUpdatePost (PUT)
// ==============================================
export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      post_id,
      updatedData,
    }: {
      post_id: string;
      updatedData: Partial<Post>;
      community_id?: string;
    }) => {
      const response = await deletePost(post_id);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al actualizar el post");
      }
      return response.data as Post;
    },

    onMutate: async ({ post_id, updatedData, community_id }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      if (community_id) {
        await queryClient.cancelQueries({ queryKey: ["posts", community_id] });
      }
      await queryClient.cancelQueries({ queryKey: ["post", post_id] });

      const previousGlobalPosts = queryClient.getQueryData(["posts"]);
      const previousCommunityPosts = community_id
        ? queryClient.getQueryData(["posts", community_id])
        : null;
      const previousPostDetail = queryClient.getQueryData(["post", post_id]);

      const updatePostInInfiniteQuery = (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data
              ? page.data.map((p: Post) =>
                  p.id === post_id ? { ...p, ...updatedData } : p,
                )
              : [],
          })),
        };
      };

      queryClient.setQueryData(["posts"], updatePostInInfiniteQuery);
      if (community_id) {
        queryClient.setQueryData(
          ["posts", community_id],
          updatePostInInfiniteQuery,
        );
      }

      queryClient.setQueryData(["post", post_id], (oldPost: any) => {
        if (!oldPost) return oldPost;
        return { ...oldPost, ...updatedData };
      });

      return {
        previousGlobalPosts,
        previousCommunityPosts,
        previousPostDetail,
        community_id,
        post_id,
      };
    },

    onError: (err, variables, context) => {
      console.error("Error al actualizar post, aplicando rollback:", err);
      if (context) {
        queryClient.setQueryData(["posts"], context.previousGlobalPosts);
        if (context.community_id && context.previousCommunityPosts) {
          queryClient.setQueryData(
            ["posts", context.community_id],
            context.previousCommunityPosts,
          );
        }
        if (context.previousPostDetail) {
          queryClient.setQueryData(
            ["post", context.post_id],
            context.previousPostDetail,
          );
        }
      }
    },
  });
};
