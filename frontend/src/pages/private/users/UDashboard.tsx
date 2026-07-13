import { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { Post, ResponseWithPagination } from "@interface/global";
import PostCard from "@/components/features/post/PostCard";

import { useInView } from "react-intersection-observer";
import { getAll } from "@/services/post.api";

import Loader from "@/components/ui/feedback/Loader";

const UDashboard = () => {
  const { ref, inView } = useInView({
    rootMargin: "200px",
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    error,
    isLoading,
  } = useInfiniteQuery<ResponseWithPagination<Post>>({
    queryKey: ["posts"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getAll(pageParam as number);

      if (!response) throw new Error("Error obteniendo las órdenes");
      return response as ResponseWithPagination<Post>;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.hasMore) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,

    staleTime: 1000 * 60 * 20,
    gcTime: 1000 * 60 * 60,
    retry: 3,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts =
    data?.pages
      .flatMap((page) => page.data)
      .filter((post): post is Post => Boolean(post)) || [];

  if (isError) {
    return (
      <section className="w-[80%] mx-auto mt-10 text-center text-red-500">
        <p>Error al cargar los posts</p>
        <p className="text-sm text-gray-600">{(error as Error).message}</p>
      </section>
    );
  }

  return (
    <main className="h-full px-2 md:px-8 flex-wrap flex flex-col md:flex-row gap-8 my-5 bg-bg-semi-white">
      {isLoading ? (
        <div className="flex-1 flex justify-center items-center py-20">
          <Loader size={26} color="#e5a657" />
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-y-2">
          {posts.map((post: Post) => (
            <div
              key={post.id}
              className="w-full rounded-xl border border-dashed border-gray-300 overflow-hidden"
            >
              <PostCard post={post} type="HOME" padding="px-6 py-4" />
            </div>
          ))}
          {/* Sentinel */}
          <div
            ref={ref}
            className="w-full py-4 flex justify-center"
            aria-hidden="true"
          >
            {isFetchingNextPage && (
              <div className="flex justify-center items-center">
                <Loader size={20} color="#e5a657" />
              </div>
            )}
            {!hasNextPage && (
              <div className="text-sm text-text-4">
                No hay más posts para mostrar
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default UDashboard;
