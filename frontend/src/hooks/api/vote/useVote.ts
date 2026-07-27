import type {
  ContentType,
  Post,
  PostComment,
  VoteType,
} from "@/interface/global";
import { createVote } from "@/services/vote.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

//==============================================
// useVote (POST)
//==============================================
export const useVote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      type,
      content_id,
      content_type,
    }: {
      type: VoteType;
      content_id: string;
      content_type: ContentType;
    }) => {
      return await createVote(type, content_id, content_type);
    },

    onMutate: async ({ type, content_id, content_type }) => {
      // 1. FUNCIÓN REUTILIZABLE PARA CALCULAR LOS VOTOS
      const calculateNewVotes = (oldItem: any) => {
        let new_votes_up = oldItem.votes_up;
        let new_votes_down = oldItem.votes_down;
        let new_user_vote = oldItem.user_vote === type ? null : type;

        if (type === "UP") {
          if (oldItem.user_vote === "UP") {
            new_votes_up--;
          } else if (oldItem.user_vote === "DOWN") {
            new_votes_up++;
            new_votes_down--;
          } else {
            new_votes_up++;
          }
        } else {
          if (oldItem.user_vote === "DOWN") {
            new_votes_down--;
          } else if (oldItem.user_vote === "UP") {
            new_votes_down++;
            new_votes_up--;
          } else {
            new_votes_down++;
          }
        }

        return {
          ...oldItem,
          votes_up: new_votes_up,
          votes_down: new_votes_down,
          user_vote: new_user_vote,
        };
      };

      if (content_type === "POST") {
        // --- A. ACTUALIZAR EL POST INDIVIDUAL ---
        const singlePostQueryKey = ["post", content_id];
        await queryClient.cancelQueries({ queryKey: singlePostQueryKey });
        const previousSinglePost = queryClient.getQueryData(singlePostQueryKey);

        queryClient.setQueryData(singlePostQueryKey, (old: Post) => {
          if (!old) return old;
          return calculateNewVotes(old);
        });

        // --- B. ACTUALIZAR LA LISTA INFINITA DE POSTS ---
        // Usamos queryKey: ["posts"] para atrapar cualquier query que empiece con "posts"
        const postsQueryFilter = { queryKey: ["posts"] };
        await queryClient.cancelQueries(postsQueryFilter);
        const previousPostsQueries =
          queryClient.getQueriesData(postsQueryFilter);

        queryClient.setQueriesData(postsQueryFilter, (oldData: any) => {
          if (!oldData || !oldData.pages) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              // Asumiendo que tu array de posts viene dentro de page.data
              data: page.data.map((post: Post) => {
                if (post.id === content_id) {
                  return calculateNewVotes(post); // Actualizamos el post si coincide el ID
                }
                return post; // Si no, lo dejamos igual
              }),
            })),
          };
        });

        // Retornamos ambos respaldos para el rollback en caso de error
        return {
          previousSinglePost,
          previousPostsQueries,
          singlePostQueryKey,
          type: "POST",
        };
      } else {
        // --- C. LÓGICA DE COMENTARIOS (Sin cambios estructurales, solo usa la función helper) ---
        const queryFilter = { queryKey: ["comments"] };
        await queryClient.cancelQueries(queryFilter);
        const previousQueries = queryClient.getQueriesData(queryFilter);

        queryClient.setQueriesData(queryFilter, (oldData: any) => {
          if (!oldData || !oldData.pages) return oldData;

          const deepUpdate = (comments: PostComment[]): PostComment[] => {
            return comments.map((c) => {
              let updatedComment = c;

              if (c.id === content_id) {
                updatedComment = calculateNewVotes(c);
              }

              if (updatedComment.replies && updatedComment.replies.length > 0) {
                updatedComment = {
                  ...updatedComment,
                  replies: deepUpdate(updatedComment.replies),
                };
              }

              return updatedComment;
            });
          };

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: deepUpdate(page.data),
            })),
          };
        });

        return { previousQueries, type: "COMMENT" };
      }
    },

    onError: (err, newVote, context: any) => {
      if (context?.type === "POST") {
        if (context.previousSinglePost && context.singlePostQueryKey) {
          queryClient.setQueryData(
            context.singlePostQueryKey,
            context.previousSinglePost,
          );
        }
        // Restaurar lista infinita
        if (context.previousPostsQueries) {
          context.previousPostsQueries.forEach(([queryKey, data]: any) => {
            queryClient.setQueryData(queryKey, data);
          });
        }
      } else if (context?.type === "COMMENT" && context?.previousQueries) {
        // Restaurar comentarios
        context.previousQueries.forEach(([queryKey, data]: any) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
  });
};
