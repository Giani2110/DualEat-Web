import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getUserCommunities, joinLeave } from "@/services/community.api";
import type { Community, CommunityMember } from "@/interface/global";

export const useMyCommunities = () => {
  return useQuery({
    queryKey: ["myCommunities"],
    queryFn: async () => {
      try {
        const response = await getUserCommunities();

        if (!response.success || !response.data) {
          throw new Error("Error en la respuesta del post");
        }

        return response.data as CommunityMember[];
      } catch (e: any) {
        if (e.response.status === 404) {
          return [] as CommunityMember[];
        }
        throw e;
      }
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    retry: 1,
  });
};

export const useJoinLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      community,
      join,
    }: {
      community: Community;
      join: boolean;
    }) => {
      const response = await joinLeave(community.id, join);
      if (!response.success) {
        throw new Error(
          response.message || "Error al unirse/salir de la comunidad",
        );
      }
      return response;
    },

    onMutate: async ({ join, community }) => {
      const communityKey = ["community", community.slug];

      await queryClient.cancelQueries({ queryKey: communityKey });

      const previousCommunity = queryClient.getQueryData(communityKey);

      queryClient.setQueryData(communityKey, (oldCommunity: Community) => {
        if (!oldCommunity) return oldCommunity;

        return {
          ...oldCommunity,
          isMember: join,
          total_members: join
            ? oldCommunity.total_members + 1
            : oldCommunity.total_members - 1,
        };
      });

      return { previousCommunity, communityKey };
    },

    onError: (err, variables, context: any) => {
      if (context?.previousCommunity) {
        queryClient.setQueryData(
          context.communityKey,
          context.previousCommunity,
        );
      }
    },

    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["myCommunities"] });
    },
  });
};
