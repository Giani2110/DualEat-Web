import { useEffect, useRef } from "react";
import { useAuth } from "@hooks/useAuth";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllPosts } from "@/services/post.api";
import type { Posts, ResponseWithPagination } from "@interface/global";
import PostCard from "@/components/users/cards/PostCard";
import { Loader } from "lucide-react";

const UDashboard = () => {
  const { user } = useAuth();

  // Ref para el sentinel del IntersectionObserver
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    error,
  } = useInfiniteQuery<ResponseWithPagination<Posts>>({
    queryKey: ["allPosts"],
    queryFn: ({ pageParam = 1 }) => getAllPosts(pageParam as number, false),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasMore) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Observer para el sentinel
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        // Si el sentinel es visible Y hay más páginas Y no estamos cargando
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "200px", // Cargar antes de llegar al final
        threshold: 0.1,
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allPosts =
    data?.pages
      .flatMap((page) => page.data)
      .filter((post): post is Posts => Boolean(post)) || [];
  
  if (isError) {
    return (
      <section className="w-[80%] mx-auto mt-10 text-center text-red-500">
        <p>Error al cargar los posts</p>
        <p className="text-sm text-gray-600">{(error as Error).message}</p>
      </section>
    );
  }

  return (
    <section className="w-[95%] md:w-[80%] mx-auto flex flex-col gap-3  mt-5 ">
      <div className="flex gap-3">
        <div className="flex flex-col gap-2 flex-2">
          {Array.isArray(allPosts) && allPosts.length > 0 ? (
            allPosts.map((post: Posts) => (
              <div key={post.id}>
                <PostCard Post={post} isDashboard={true} />
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 mt-5">
              No hay posts disponibles para mostrar.
            </div>
          )}

          {/* Sentinel */}
          <div
            ref={loaderRef}
            className="w-full py-4 flex justify-center"
            aria-hidden="true"
          >
            {isFetchingNextPage && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader className="animate-spin" size={16} />
                <span className="text-sm">Cargando más posts...</span>
              </div>
            )}

            {!hasNextPage && allPosts.length > 0 && (
              <div className="text-sm text5">
                No hay más posts para mostrar
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 hidden lg:block">{/* Sidebar */}</div>
      </div>
    </section>
  );
};

export default UDashboard;
