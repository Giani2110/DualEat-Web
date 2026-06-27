import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBySlug } from "@services/community.api";
import { Plus } from "lucide-react";

import PostCard from "@/components/features/post/PostCard";

import type {
  Post,
  Community,
  ResponseWithPagination,
} from "@interface/global";

import { useAuth } from "@hooks/useAuth";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import CommunityInfo from "@/components/features/community/CommunityInfo";
import { getCommunityPosts } from "@/services/post.api";
import { useInView } from "react-intersection-observer";
import Loader from "@/components/ui/feedback/Loader";
import { usePostCreateStore } from "@/context/store/usePostCreate";
import { ROUTES } from "@/api/constants/constants";
import { useJoinLeave } from "@/hooks/api/community/useCommunity";

export default function CommunityScreen() {
  const navigate = useNavigate();

  const { setPost } = usePostCreateStore();
  const { mutate: joinLeave } = useJoinLeave();

  const { community_slug } = useParams<{ community_slug: string }>();
  const { user } = useAuth();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const { ref, inView } = useInView({
    rootMargin: "200px",
  });

  const { data: community, isLoading } = useQuery({
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

  const posts = useMemo(() => {
    return (
      data?.pages
        .flatMap((page) => page?.data || [])
        .filter((post): post is Post => Boolean(post)) || []
    );
  }, [data]);

  const isMember = useMemo(() => {
    return community?.isMember || false;
  }, [community]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const BellOut = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="22"
      width="22"
      viewBox="0 0 640 640"
    >
      <path
        fill="#b53325"
        d="M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L513.1 479.4C530.6 476.1 543.9 460.7 543.9 442.3C543.9 435.6 542.1 429 538.8 423.3L517 385.7C498 353.1 488 316.1 488 278.4L488 263.9C488 179.3 425.4 109.2 344 97.6L344 87.9C344 74.6 333.3 63.9 320 63.9C306.7 63.9 296 74.6 296 87.9L296 97.6C253.8 103.6 216.6 125.4 190.6 156.7L73 39.1zM224.8 190.9C246.7 162.4 281.2 144 320 144C386.3 144 440 197.7 440 264L440 278.5C440 324.7 452.3 370 475.5 409.9L488.4 432L465.8 432L224.7 190.9zM164.5 409.9C184 376.5 195.8 339.2 199.1 300.9L152.4 254.2C152.2 257.5 152.1 260.8 152.1 264.1L152.1 278.6C152.1 316.3 142.1 353.3 123.1 385.9L101.1 423.2C97.7 429 96 435.5 96 442.2C96 463.1 112.9 480 133.8 480L378.2 480L330.2 432L151.6 432L164.5 409.9zM252.1 528C262 556 288.7 576 320 576C351.3 576 378 556 387.9 528L252.1 528z"
      />
    </svg>
  );

  const BellFill = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="22"
      width="22"
      viewBox="0 0 640 640"
    >
      <path
        fill="#0A449B"
        d="M320 64C302.3 64 288 78.3 288 96L288 99.2C215 114 160 178.6 160 256L160 277.7C160 325.8 143.6 372.5 113.6 410.1L103.8 422.3C98.7 428.6 96 436.4 96 444.5C96 464.1 111.9 480 131.5 480L508.4 480C528 480 543.9 464.1 543.9 444.5C543.9 436.4 541.2 428.6 536.1 422.3L526.3 410.1C496.4 372.5 480 325.8 480 277.7L480 256C480 178.6 425 114 352 99.2L352 96C352 78.3 337.7 64 320 64zM258 528C265.1 555.6 290.2 576 320 576C349.8 576 374.9 555.6 382 528L258 528z"
      />
    </svg>
  );

  if (isLoading) {
    return (
      <section className="bg-bg-semi-white flex flex-col justify-center h-full items-center px-4">
        <Loader size={30} color="#e5a657" />
      </section>
    );
  }

  return (
    <section className="bg-bg-semi-white flex flex-col items-center flex-1 px-2 md:px-8 my-5">
      <div className="md:max-w-[70vw] flex flex-col gap-y-6">
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
                    title: "",
                    content: "",
                    image_urls: [],
                    community: community as Community,
                  });
                  navigate(ROUTES.USER.CREATE_POST);
                }}
                className="rounded-full border border-dashed hover:border-solid hover:scale-105 transition-all duration-100 cursor-pointer border-gray-400 flex items-center gap-2 px-4 py-1.5 font-semibold"
              >
                <Plus size={24} />
                <span className="text-sm">Crear post/receta</span>
              </button>

              {isMember && community?.receives_notifications && (
                <div
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative rounded-full border border-dashed cursor-pointer border-gray-400 px-4 py-1.5 flex items-center justify-center hover:border-solid hover:scale-105 transition-all duration-100"
                >
                  {community.receives_notifications === "ALWAYS"
                    ? BellFill
                    : BellOut}

                  {isNotificationOpen && (
                    <div className="absolute z-50 -bottom-24 right-0 w-[160px] rounded-[10px] border border-dashed border-gray-200 overflow-hidden">
                      {["Siempre", "Nunca"].map((notification, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            console.log("clickeaste", notification)
                          }
                          className={`${
                            community.receives_notifications === notification
                              ? "bg-[#dbdbdb]"
                              : "bg-white"
                          } flex w-full cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100`}
                        >
                          {idx === 0 ? BellFill : BellOut}
                          <span className="text-sm font-bold text-text-5">
                            {notification}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (!community) return;
                  joinLeave({
                    community,
                    join: !isMember,
                  });
                }}
                className={`rounded-full border border-gray-400 cursor-pointer px-4 py-[6px] font-semibold hover:bg-gray-100 ${
                  community?.creator_id === user?.id
                    ? "bg-red"
                    : isMember
                      ? "bg-white"
                      : "bg-blue"
                }`}
              >
                <span
                  className={`text-sm ${
                    community?.creator_id === user?.id
                      ? "text-white"
                      : isMember
                        ? "text-gray-700"
                        : "text-white"
                  }`}
                >
                  {community?.creator_id === user?.id
                    ? "Eres el moderador"
                    : isMember
                      ? "Se unió"
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
                className="w-full rounded-xl border border-dashed border-gray-200 overflow-hidden"
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

              {!hasNextPage && posts.length > 0 && (
                <div className="text-sm text-text-5 py-3 px-6 text-center w-full">
                  No hay más posts para mostrar
                </div>
              )}
            </div>
          </main>

          <aside style={{ flex: 1 }}>
            {/* Información de la comunidad */}
            {community && (
              <CommunityInfo community={community} isCommunity={true} />
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
