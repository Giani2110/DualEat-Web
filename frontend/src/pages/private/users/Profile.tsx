import { useAuth } from "@/hooks/useAuth";
import type {
  Post,
  PostComment,
  Recipe,
  ResponseWithPagination,
  User,
} from "@/interface/global";
import { getUserById, getUserSearch } from "@/services/auth.api";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  Settings,
  Clock,
  Utensils,
  Star,
  Search,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import PostCard from "@/components/features/post/PostCard";
import { ROUTES } from "@/api/constants/constants";
import Loader from "@/components/ui/feedback/Loader";

import SettingsModal from "@/components/features/config/SettingsModal";

type GlobalSearch = Post | Recipe | PostComment;

const TABS = ["posts", "recipes", "comments", "reviews"] as const;

type TabType = (typeof TABS)[number];

const TAB_LABELS: Record<TabType, string> = {
  posts: "Posts",
  recipes: "Recetas",
  comments: "Comentarios",
  reviews: "Reseñas",
} as const;

export default function ProfileScreen() {
  const { user, refreshUser } = useAuth();
  const { user_id } = useParams<{ user_id: string }>();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<TabType>("posts");

  const [open, setOpen] = useState<boolean>(false);

  const { ref, inView } = useInView({
    rootMargin: "200px",
  });

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["user", user_id],
    queryFn: async () => {
      if (!user_id) return;
      const response = await getUserById(user_id);
      if (!response?.success || !response?.data) {
        throw new Error("Error en la respuesta del post");
      }
      return response.data as User;
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!user_id,
  });

  useEffect(() => {
    if (userData) {
      navigate(`/profile/${userData.id}/${userData.slug}`, { replace: true });
    }
  }, [userData, navigate]);

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["user-search", user?.id, tab, query],
      queryFn: async ({ pageParam = 1 }) => {
        const response = await getUserSearch(
          String(user_id),
          query,
          tab,
          pageParam as number,
        );
        if (!response?.success || !response?.data) {
          throw new Error("Error en la respuesta");
        }
        return response as ResponseWithPagination<GlobalSearch[]>;
      },
      getNextPageParam: (lastPage) => {
        if (lastPage?.pagination?.hasMore) {
          return lastPage.pagination.page + 1;
        }
        return undefined;
      },
      initialPageParam: 1,
      enabled: !!user?.id,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      placeholderData: (keepPreviousData) => keepPreviousData,
      staleTime: 1000 * 60 * 10,
      gcTime: 1000 * 60 * 30,
      retry: 3,
    });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const isloading = userLoading || isFetching;

  const items =
    data?.pages
      .flatMap((page) => page.data || [])
      .filter((item): item is GlobalSearch => Boolean(item)) || [];

  const formatJoinedDate = (dateString?: Date | string) => {
    if (!dateString) return "";
    const formatted = format(new Date(dateString), "MMMM 'de' yyyy", {
      locale: es,
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const isOwner = user?.id === user_id || user?.id === userData?.id;

  return (
    <main className="min-h-screen px-8 flex justify-center my-5 bg-bg-semi-white">
      <div className="flex flex-col gap-y-6 w-full md:max-w-[65vw]">
        <section className="border border-dashed border-gray-300 rounded-[20px] shadow-sm p-6 flex flex-col gap-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex flex-wrap items-center gap-5">
              <div style={{ width: 96, height: 96 }} className="relative">
                <img
                  src={
                    userData?.avatar_url ||
                    "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png"
                  }
                  className="w-full h-full object-cover rounded-full border border-dashed border-gray-200"
                  alt="Avatar de usuario"
                />
              </div>

              <div className="flex flex-col">
                <h1 className="text-[26px] font-bold text-text-3">
                  {userData?.name}
                </h1>
                <p className="text-[16px] text-text-6">@{userData?.slug}</p>

                <div className="flex items-center gap-1.5 text-text-5 text-sm mt-1">
                  <Calendar size={16} className="text-text-4" />
                  <span>
                    Se unió en{" "}
                    {userData?.created_at
                      ? formatJoinedDate(userData.created_at)
                      : "---"}
                  </span>
                </div>
              </div>
            </div>

            {isOwner && (
              <button
                onClick={() => {
                  React.startTransition(() => {
                    setOpen(true);
                  });
                }}
                className="flex cursor-pointer items-center gap-x-2 px-4 py-2 border border-gray-300 rounded-[10px] hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
              >
                <Settings size={15} />
                <span className="text-[14px] text-text-5 font-semibold">
                  Editar perfil y ajustes
                </span>
              </button>
            )}
          </div>

          <div className="flex flex-col gap-y-4">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav
                className="flex gap-x-2 -mb-px overflow-x-auto scrollbar-none"
                aria-label="Tabs"
              >
                {TABS.map((t) => {
                  const active = tab === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`relative cursor-pointer px-4 py-3 text-sm font-semibold transition-all duration-200 whitespace-nowrap outline-none ${
                        active
                          ? "text-text-3 bg-gray-100/50 rounded-t-xl"
                          : "text-text-6 hover:text-text-3 hover:bg-gray-50/50 rounded-t-xl"
                      }`}
                    >
                      {TAB_LABELS[t]}
                      {active && (
                        <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-text-3 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="w-full border border-gray-200 rounded-full px-3 flex flex-row gap-x-2 items-center">
              <Search size={18} className="hidden md:block" color="#2F2F2F" />
              <input
                type="text"
                onChange={(e) => {
                  if (!e.target.value) {
                    setQuery("");
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const searchTerm = (e.target as HTMLInputElement).value;
                    setQuery(searchTerm);
                  }
                }}
                className="w-full text-sm outline-none py-2"
                placeholder="Buscar"
              />
            </div>
          </div>
        </section>

        {/* Tab Content Section */}
        <section className="flex flex-col gap-4">
          {isloading ? (
            <div className="flex items-center justify-center py-16">
              <Loader color="#e5a657" size={30} />
            </div>
          ) : !isloading && items.length === 0 ? (
            <div className="flex flex-col gap-y-1 items-center justify-center py-16">
              <h3 className="text-base font-bold text-text-3">
                No hay nada aquí todavía
              </h3>
              <p className="text-text-4 text-sm">
                Este usuario no ha publicado{" "}
                {tab === "posts"
                  ? "posts"
                  : tab === "recipes"
                    ? "recetas"
                    : tab === "comments"
                      ? "comentarios"
                      : "reseñas"}{" "}
                en su perfil.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Posts Tab */}
              {tab === "posts" && (
                <div className="flex flex-col gap-5">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="w-full rounded-xl border border-gray-200 overflow-hidden"
                    >
                      <PostCard post={item as Post} type="HOME" padding="p-4" />
                    </div>
                  ))}
                </div>
              )}

              {/* Recipes Tab */}
              {tab === "recipes" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item) => {
                    const recipe = item as Recipe;
                    return (
                      <div
                        key={recipe.id}
                        onClick={() =>
                          navigate(ROUTES.USER.RECIPE(recipe.id, recipe.slug))
                        }
                        className="bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 rounded-2xl p-4 flex gap-4 cursor-pointer"
                      >
                        <img
                          src={
                            recipe.main_image || "https://placehold.co/400x400"
                          }
                          className="w-24 h-24 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                          alt={recipe.name}
                        />
                        <div className="flex flex-col justify-between py-0.5">
                          <div>
                            <h4 className="font-bold text-text-3 text-base leading-snug line-clamp-1 hover:text-bg-red transition-colors">
                              {recipe.name}
                            </h4>
                            <p className="text-text-5 text-xs line-clamp-2 mt-1 leading-normal">
                              {recipe.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 text-text-6 text-xs mt-2">
                            {recipe.total_time && (
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {recipe.total_time} min
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Utensils size={12} />
                              {recipe.ingredients?.length || 0} ing.
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Comments Tab */}
              {tab === "comments" && (
                <div className="flex flex-col gap-4">
                  {items.map((item) => {
                    const comment = item as PostComment;
                    return (
                      <div
                        key={comment.id}
                        className="
                        border border-gray-300 hover:bg-gray-50 hover:border-gray-400
                        
                        rounded-[20px] p-5 shadow-sm hover:shadow-md transition-all hover:border-bg-gray-50 duration-200"
                      >
                        <div className="flex flex-wrap items-center gap-x-2 text-xs text-text-6 mb-2">
                          <span className="font-medium">Comentó en</span>
                          <span
                            onClick={() =>
                              comment.post &&
                              navigate(
                                ROUTES.USER.POST(
                                  comment.post.id,
                                  comment.post.slug,
                                ),
                              )
                            }
                            className="font-bold text-bg-blue hover:underline cursor-pointer"
                          >
                            {comment.post?.title || "Post"}
                          </span>
                          <span>•</span>
                          <span>{formatJoinedDate(comment.created_at)}</span>
                        </div>
                        <p className="text-text-3 text-[15px] font-normal leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Reviews Tab */}
              {tab === "reviews" && (
                <div className="flex flex-col gap-4">
                  {items.map((item) => {
                    const review = item as any;
                    return (
                      <div
                        key={review.id}
                        className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {review.local?.image_url && (
                              <img
                                src={review.local.image_url}
                                className="w-10 h-10 object-cover rounded-xl border border-gray-100"
                                alt={review.local?.name}
                              />
                            )}
                            <div>
                              <h4 className="font-bold text-text-3 text-sm">
                                {review.local?.name || "Local"}
                              </h4>
                              <div className="flex items-center gap-0.5 mt-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    size={12}
                                    className={
                                      i < (review.rating || 0)
                                        ? "fill-bg-yellow text-bg-yellow"
                                        : "text-gray-300"
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-text-6">
                            {formatJoinedDate(review.created_at)}
                          </span>
                        </div>

                        {review.comment && (
                          <p className="text-text-5 text-[14px] mt-3 leading-relaxed">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Sentinel */}
              <div
                ref={ref}
                className="w-full flex items-center py-4 gap-3 justify-center"
                aria-hidden="true"
              >
                {isFetchingNextPage && <Loader color="#e5a657" size={18} />}
                {!hasNextPage && items.length > 0 && (
                  <div className="text-sm text-text-6">
                    No hay más contenido para mostrar
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {open && userData && (
          <SettingsModal
            isOpen={open}
            onClose={() => setOpen(false)}
            userData={userData}
            refreshUser={refreshUser}
          />
        )}
      </div>
    </main>
  );
}
