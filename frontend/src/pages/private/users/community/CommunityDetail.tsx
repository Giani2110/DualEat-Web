import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBySlug } from "@services/community.api";
import { BellOff, BellRing, Plus } from "lucide-react";

import PostCard from "@/components/features/post/PostCard";

import type {
  Post,
  Community,
  ResponseWithPagination,
} from "@interface/global";

import { useAuth } from "@hooks/useAuth";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import CommunityInfo from "@/components/features/community/CommunityInfo";
import { getCommunityPosts } from "@/services/post.api";
import { useInView } from "react-intersection-observer";
import Loader from "@/components/ui/feedback/Loader";
import { usePostCreateStore } from "@/context/store/usePostCreate";
import { ROUTES } from "@/api/constants/constants";
import { useJoinLeave } from "@/hooks/api/community/useCommunity";
import { changeStatus } from "@/services/notification.api";
import toast from "react-hot-toast";

export default function CommunityScreen() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { setPost } = usePostCreateStore();
  const { mutate: joinLeave } = useJoinLeave();

  const { community_slug } = useParams<{ community_slug: string }>();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);

  const { ref, inView } = useInView({
    rootMargin: "200px",
  });

  const {
    data: community,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["community", community_slug],
    queryFn: async () => {
      const response = await getBySlug(community_slug as string);
      if (!response.success || !response.data) {
        throw new Error("Error en la respuesta de la comunidad");
      }
      return response.data as Community;
    },

    enabled: !!community_slug,
    refetchOnMount: true,
    refetchOnWindowFocus: true,

    staleTime: 1000 * 60 * 20,
    gcTime: 1000 * 60 * 60,
    retry: 1,
  });

  const { data, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["posts", community?.id],

      queryFn: async ({ pageParam = 1 }) => {
        const response = await getCommunityPosts(
          community?.id as string,
          pageParam as number,
        );

        if (!response?.success || !response?.data) {
          throw new Error("Error en la respuesta de los posts");
        }

        return response as ResponseWithPagination<Post[]>;
      },

      getNextPageParam: (lastPage) => {
        if (lastPage?.pagination?.hasMore) {
          return lastPage.pagination.page + 1;
        }
        return undefined;
      },
      initialPageParam: 1,

      enabled: !!community?.id,
      refetchOnMount: true,
      refetchOnWindowFocus: true,

      staleTime: 1000 * 60 * 20,
      gcTime: 1000 * 60 * 60,
      retry: 3,
    });

  const { mutate: mutateNotification } = useMutation({
    mutationFn: async (type: "ALWAYS" | "NONE") => {
      if (!community) {
        return;
      }
      if (community.receives_notifications === type) {
        return;
      }
      const response = await changeStatus(community?.id, "member", type);

      if (!response.success || !response.data) {
        throw new Error("Error al cambiar estado de las notificaciones");
      }
      return response.data;
    },
    onMutate: async (type: "ALWAYS" | "NONE") => {
      const previous = queryClient.getQueryData(["community", community_slug]);
      queryClient.setQueryData(
        ["community", community_slug],
        (oldData: Community) => {
          return {
            ...oldData,
            receives_notifications: type,
          };
        },
      );
      return { previous };
    },

    onSuccess: (data) => {
      queryClient.setQueryData(["community", community?.id], data);
    },
    onError: (e: any, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["community", community?.id],
          context.previous,
        );
      }
      toast.error(e.message || "Error al actualizar perfil");
    },
  });

  const posts = useMemo(() => {
    return (
      data?.pages
        .flatMap((page) => page?.data || [])
        .filter((post): post is Post => Boolean(post)) || []
    );
  }, [data]);

  const isMember = community?.isMember || false;
  const isModerator =
    community?.creator_id === user?.id || community?.is_moderator;

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (error) {
      toast.error("Esta comunidad ya no existe");
      navigate(-1);
    }
  }, [error]);

  if (isLoading) {
    return (
      <section className="bg-bg-semi-white flex flex-col justify-center h-full items-center px-4">
        <Loader size={30} color="#e5a657" />
      </section>
    );
  }

  return (
    <section className="bg-bg-semi-white flex flex-col items-center flex-1 px-2 md:px-8 my-5">
      <div className="md:max-w-[70vw] w-full flex flex-col gap-y-6">
        <header className="w-full rounded-[10px] border border-gray-200 relative">
          {/* Banner de la comunidad */}
          <div className="w-full h-32 md:h-44 overflow-hidden rounded-t-[10px]">
            <img
              alt="Banner de la comunidad"
              className="w-full h-full object-cover"
              src={
                community?.banner_url ||
                "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultBanner.jpg"
              }
            />
          </div>

          <div className="px-6 pb-6 pt-10 lg:pt-12 relative flex flex-col md:flex-row justify-between gap-4">
            <div style={{ flex: 1 }}>
              {community?.image_url && (
                <div className="absolute -top-10 left-6 w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-white overflow-hidden flex-shrink-0">
                  <img
                    alt="Logo de la comunidad"
                    className="w-full h-full object-cover"
                    src={community.image_url}
                  />
                </div>
              )}

              <h1 className="text-3xl font-bold tracking-tight text-text-3">
                {community?.name || "Comunidad"}
              </h1>
            </div>

            {/* Botones de acción */}
            <div
              style={{ flex: 2 }}
              className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end md:mt-0"
            >
              <button
                type="button"
                onClick={() => {
                  setPost({
                    id: "",
                    title: "",
                    content: "",
                    image_urls: [],
                    community: community as Community,
                    recipe: null,
                  });
                  navigate(ROUTES.USER.CREATE_POST);
                }}
                className="rounded-full border border-dashed hover:border-solid hover:scale-105 transition-all duration-100 cursor-pointer border-gray-400 flex items-center gap-2 px-4 py-1.5 font-semibold"
              >
                <Plus size={24} />
                <span className="text-sm text-text-5">Crear post/receta</span>
              </button>

              {isMember && (
                <div className="relative">
                  <button
                    type="button"
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    onClick={() => setIsOpen(!isOpen)}
                    className="rounded-full border border-dashed cursor-pointer border-gray-400 p-2.5 flex items-center justify-center hover:border-solid transition-all duration-100"
                  >
                    {community?.receives_notifications === "NONE" ? (
                      <BellOff size={18} className="text-gray-800" />
                    ) : (
                      <BellRing size={18} className="text-gray-800" />
                    )}
                  </button>

                  {isOpen && (
                    <div
                      className="absolute z-50 top-full mt-2 right-0 w-64 rounded-2xl bg-white border border-gray-100 shadow-2xl py-2 flex flex-col"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {[
                        {
                          id: "ALWAYS",
                          label: "Activadas",
                          sublabel:
                            "Recibirás las notificaciones de esta comunidad",
                          icon: BellRing,
                        },
                        {
                          id: "NONE",
                          label: "Desactivadas",
                          sublabel:
                            "Desactiva las notificaciones de esta comunidad",
                          icon: BellOff,
                          hasDivider: true,
                        },
                      ].map((button) => {
                        const isSelected =
                          community?.receives_notifications === button.id;

                        return (
                          <div key={button.id}>
                            {button.hasDivider && (
                              <div className="my-1.5 border-t border-gray-100" />
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                if (!isSelected) {
                                  mutateNotification(
                                    button.id as "ALWAYS" | "NONE",
                                  );
                                }
                                setIsOpen(false);
                              }}
                              className={`w-full flex items-center gap-3.5 px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-left`}
                            >
                              <button.icon
                                size={26}
                                className="text-gray-800"
                              />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-text-3 leading-tight">
                                  {button.label}
                                </span>
                                <span className="text-xs text-text-6 leading-tight">
                                  {button.sublabel}
                                </span>
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (!community || community?.creator_id === user?.id) return;
                  joinLeave({
                    community,
                    join: !isMember,
                  });
                }}
                className={`rounded-full cursor-pointer px-4 py-[6px] font-semibold ${
                  isModerator
                    ? "bg-bg-red"
                    : isMember
                      ? "bg-white hover:bg-gray-100 border border-gray-400"
                      : "bg-bg-blue hover:bg-gray-100"
                }`}
              >
                <span
                  className={`text-sm ${
                    isModerator
                      ? "text-white"
                      : isMember
                        ? "text-text-5"
                        : "text-white"
                  }`}
                >
                  {isModerator
                    ? "Eres el moderador"
                    : isMember
                      ? "Te uniste"
                      : "Unirse"}
                </span>
              </button>
            </div>
          </div>
        </header>

        <div className="flex flex-col-reverse md:flex-row justify-between w-full gap-4">
          <main className="flex flex-col gap-y-2 w-full" style={{ flex: 2 }}>
            {posts.map((post) => (
              <div
                key={post.id}
                className="w-full rounded-xl border border-dashed border-gray-300 overflow-hidden"
              >
                <PostCard post={post} type="COMMUNITY" padding="p-5" />
              </div>
            ))}

            {/* Sentinel */}
            <div
              ref={ref}
              className="w-full py-4 flex justify-center"
              aria-hidden="true"
            >
              {isFetchingNextPage && (
                <div className="flex flex-1 justify-center items-center">
                  <Loader color="#e5a657" size={24} />
                </div>
              )}
              {!hasNextPage && (
                <div className="text-sm text-text-4">
                  No hay más posts para mostrar
                </div>
              )}
            </div>
          </main>
          {community && (
            <aside style={{ flex: 1 }}>
              <CommunityInfo community={community} isCommunity={true} />
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}
