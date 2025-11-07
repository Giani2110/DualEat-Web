/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCommunityBySlug,
  joinCommunity,
  leaveCommunity,
} from "@services/community.api";
import { Plus } from "lucide-react";

import PostCard from "@/components/private/users/ui/PostCard";

import { getCommunityPosts } from "@services/community.api";
import type {
  Posts,
  Community,
  ResponseWithPagination,
} from "@interface/global";

import { axiosInterceptor } from "@interceptor/axios-interceptor";
import toast from "react-hot-toast";

import Loader from "@components/animation/Loader";
import { ROUTES } from "@constants/constants";

import { useCommunity } from "@hooks/useUCommunity";
import { useAuth } from "@hooks/useAuth";

import { useInfiniteQuery } from "@tanstack/react-query";
import CommunityInfo from "@/components/private/users/ui/CommunityInfo";

const UCommunity = () => {
  const { communitySlug } = useParams<{ communitySlug: string }>();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { refreshCommunities } = useCommunity();

  const [community, setCommunity] = useState<Community | null>(null);

  // UI local
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Refs para IntersectionObserver y sentinel
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    error,
  } = useInfiniteQuery<ResponseWithPagination<Posts>>({
    queryKey: ["communityPosts", community?.id],
    queryFn: ({ pageParam = 1 }) =>
      getCommunityPosts(pageParam as number, community!.id),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasMore) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!user && !!community,
    staleTime: 5 * 60 * 1000,
  });

  const handleJoinCommunity = async (community: Community) => {
    try {
      if (community.isMember && community.creator_id === user?.id) {
        toast.error("No puedes unirte a tu propia comunidad");
        return;
      }

      if (community.isMember === false) {
        const response = await joinCommunity(community.id);
        if (response && response.success) {
          setCommunity((prev) => (prev ? { ...prev, isMember: true } : prev));
          refreshCommunities();
        }
      } else {
        const response = await leaveCommunity(community.id);
        if (response && response.success) {
          setCommunity((prev) => (prev ? { ...prev, isMember: false } : prev));
          refreshCommunities();
        }
      }
    } catch (error) {
      console.error("Error al unirse a la comunidad:", error);
    }
  };

  const handleNotificationChange = async (values: string) => {
    try {
      const response = await axiosInterceptor.put("/notification/status", {
        community_id: community?.id,
        type: "member",
        value: values,
      });
      if (response && response.data.success) {
        toast.success("Preferencias actualizadas");
        setCommunity((prev) =>
          prev ? { ...prev, receives_notifications: values } : prev
        );
      }
    } catch (error) {
      console.error("Error al cambiar las preferencias:", error);
      toast.error("Error al cambiar las preferencias");
    }
  };

  const BellOut = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      width="24"
      viewBox="0 0 640 640"
    >
      <path
        fill="#b53325"
        d="M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L513.1 479.4C530.6 476.1 543.9 460.7 543.9 442.3C543.9 435.6 542.1 429 538.8 423.3L517 385.7C498 353.1 488 316.1 488 278.4L488 263.9C488 179.3 425.4 109.2 344 97.6L344 87.9C344 74.6 333.3 63.9 320 63.9C306.7 63.9 296 74.6 296 87.9L296 97.6C253.8 103.6 216.6 125.4 190.6 156.7L73 39.1zM224.8 190.9C246.7 162.4 281.2 144 320 144C386.3 144 440 197.7 440 264L440 278.5C440 324.7 452.3 370 475.5 409.9L488.4 432L465.8 432L224.7 190.9zM164.5 409.9C184 376.5 195.8 339.2 199.1 300.9L152.4 254.2C152.2 257.5 152.1 260.8 152.1 264.1L152.1 278.6C152.1 316.3 142.1 353.3 123.1 385.9L101.1 423.2C97.7 429 96 435.5 96 442.2C96 463.1 112.9 480 133.8 480L378.2 480L330.2 432L151.6 432L164.5 409.9zM252.1 528C262 556 288.7 576 320 576C351.3 576 378 556 387.9 528L252.1 528z"
      />
    </svg>
  );

  const BellIn = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      width="24"
      viewBox="0 0 640 640"
    >
      <path
        fill="#e5a657"
        d="M320 64C306.7 64 296 74.7 296 88L296 97.7C214.6 109.3 152 179.4 152 264L152 278.5C152 316.2 142 353.2 123 385.8L101.1 423.2C97.8 429 96 435.5 96 442.2C96 463.1 112.9 480 133.8 480L506.2 480C527.1 480 544 463.1 544 442.2C544 435.5 542.2 428.9 538.9 423.2L517 385.7C498 353.1 488 316.1 488 278.4L488 263.9C488 179.3 425.4 109.2 344 97.6L344 87.9C344 74.6 333.3 63.9 320 63.9zM488.4 432L151.5 432L164.4 409.9C187.7 370 200 324.6 200 278.5L200 264C200 197.7 253.7 144 320 144C386.3 144 440 197.7 440 264L440 278.5C440 324.7 452.3 370 475.5 409.9L488.4 432zM252.1 528C262 556 288.7 576 320 576C351.3 576 378 556 387.9 528L252.1 528z"
      />
    </svg>
  );

  const BellFill = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      width="24"
      viewBox="0 0 640 640"
    >
      <path
        fill="#0A449B"
        d="M320 64C302.3 64 288 78.3 288 96L288 99.2C215 114 160 178.6 160 256L160 277.7C160 325.8 143.6 372.5 113.6 410.1L103.8 422.3C98.7 428.6 96 436.4 96 444.5C96 464.1 111.9 480 131.5 480L508.4 480C528 480 543.9 464.1 543.9 444.5C543.9 436.4 541.2 428.6 536.1 422.3L526.3 410.1C496.4 372.5 480 325.8 480 277.7L480 256C480 178.6 425 114 352 99.2L352 96C352 78.3 337.7 64 320 64zM258 528C265.1 555.6 290.2 576 320 576C349.8 576 374.9 555.6 382 528L258 528z"
      />
    </svg>
  );

  // Obtener comunidad
  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        if (communitySlug) {
          const response = await getCommunityBySlug(communitySlug);
          if (response && response.data) {
            setCommunity(response.data as Community);
          } else {
            navigate(ROUTES.ERROR, { replace: true });
          }
        }
      } catch (error) {
        console.error("Error al obtener la comunidad:", error);
        navigate(ROUTES.ERROR, { replace: true });
      }
    };
    fetchCommunity();
  }, [communitySlug]);

  // IntersectionObserver
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

  const communityPosts =
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
    <section className="w-[95%] md:w-[80%] md:max-w-[1000px] lg:max-w-[1200px] mx-auto flex flex-col gap-3 rounded-[10px] mt-5 ">
      {/* Contenedor de la comunidad */}
      <div className="w-full rounded-lg relative">
        {/* Banner */}
        <div className="w-full h-32 md:h-34 rounded-lg overflow-hidden">
          {community?.theme_color !== null ? (
            <img
              alt="Banner de la comunidad"
              className="w-full h-32 md:h-34 object-cover"
              src={community?.theme_color}
            />
          ) : (
            <div className="w-full h-18 md:h-20 rounded-lg object-cover bg-red" />
          )}
        </div>

        {/* Contenedor flexible sobre el banner */}
        <div
          className={`flex justify-between flex-col gap-3 lg:gap-0 lg:flex-row lg:items-end  items-start px-5 w-full absolute ${
            community?.theme_color !== null
              ? " -bottom-26 md:-bottom-23 lg:-bottom-14"
              : "-bottom-5 md:-bottom-3 lg:-bottom-2"
          }`}
        >
          {/* Logo + Nombre */}
          <div className="flex items-end gap-4">
            {community?.image_url && (
              <img
                alt="Logo de la comunidad"
                className="w-18 h-18 lg:w-22 lg:h-22 object-cover rounded-full border-4 border-white flex-shrink-0"
                src={community.image_url || ""}
              />
            )}
            {community?.name && (
              <h2 className="text-[28px] sm:text-[30px] lg:text-[33px] Dosis-Bold tracking-tight text-gray-900">
                {community.name}
              </h2>
            )}
          </div>

          {/* Botón acción */}
          <div className="flex items-center flex-shrink-0 gap-2">
            <button
              type="button"
              className="rounded-full border cursor-pointer border-gray-300 flex items-center gap-2 px-4 py-[6px] text-sm Dosis-Bold hover:bg-gray-100"
            >
              <Plus size={24} />
              <span className="text-[15px]">Crear post/receta</span>
            </button>

            {community?.isMember && community?.receives_notifications && (
              <div
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative rounded-full border cursor-pointer border-gray-300 px-4 py-[6px]"
              >
                {community.receives_notifications === "FREQUENT"
                  ? BellFill
                  : community.receives_notifications === "RARE"
                  ? BellIn
                  : BellOut}

                {isNotificationOpen && (
                  <div className="absolute z-50 -bottom-30 right-0 w-[160px] rounded-[10px] shadow-sm">
                    <button
                      type="button"
                      onClick={() => handleNotificationChange("FREQUENT")}
                      className={`${
                        community.receives_notifications === "FREQUENT"
                          ? "bg-[#dbdbdb]"
                          : "bg-white"
                      } flex w-full cursor-pointer  items-center rounded-tl-[10px] rounded-tr-[10px] gap-2 px-5 py-[8px] text-[15px] hover:bg-gray-100`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24"
                        width="24"
                        viewBox="0 0 640 640"
                      >
                        <path
                          fill="#4A4947"
                          d="M320 64C302.3 64 288 78.3 288 96L288 99.2C215 114 160 178.6 160 256L160 277.7C160 325.8 143.6 372.5 113.6 410.1L103.8 422.3C98.7 428.6 96 436.4 96 444.5C96 464.1 111.9 480 131.5 480L508.4 480C528 480 543.9 464.1 543.9 444.5C543.9 436.4 541.2 428.6 536.1 422.3L526.3 410.1C496.4 372.5 480 325.8 480 277.7L480 256C480 178.6 425 114 352 99.2L352 96C352 78.3 337.7 64 320 64zM258 528C265.1 555.6 290.2 576 320 576C349.8 576 374.9 555.6 382 528L258 528z"
                        />
                      </svg>
                      <span className="text-[15px]">Frecuentes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNotificationChange("RARE")}
                      className={`${
                        community.receives_notifications === "RARE"
                          ? "bg-[#dbdbdb]"
                          : "bg-white"
                      } flex w-full cursor-pointer border-t border-b border-[#dbdbdb] items-center gap-2 px-5 py-[8px] text-[15px] hover:bg-gray-100`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24"
                        width="24"
                        viewBox="0 0 640 640"
                      >
                        <path
                          fill="#4A4947"
                          d="M320 64C306.7 64 296 74.7 296 88L296 97.7C214.6 109.3 152 179.4 152 264L152 278.5C152 316.2 142 353.2 123 385.8L101.1 423.2C97.8 429 96 435.5 96 442.2C96 463.1 112.9 480 133.8 480L506.2 480C527.1 480 544 463.1 544 442.2C544 435.5 542.2 428.9 538.9 423.2L517 385.7C498 353.1 488 316.1 488 278.4L488 263.9C488 179.3 425.4 109.2 344 97.6L344 87.9C344 74.6 333.3 63.9 320 63.9zM488.4 432L151.5 432L164.4 409.9C187.7 370 200 324.6 200 278.5L200 264C200 197.7 253.7 144 320 144C386.3 144 440 197.7 440 264L440 278.5C440 324.7 452.3 370 475.5 409.9L488.4 432zM252.1 528C262 556 288.7 576 320 576C351.3 576 378 556 387.9 528L252.1 528z"
                        />
                      </svg>
                      <span className="text-[15px]">Pocas</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNotificationChange("NONE")}
                      className={`${
                        community.receives_notifications === "NONE"
                          ? "bg-[#dbdbdb]"
                          : "bg-white"
                      } flex w-full cursor-pointer items-center rounded-bl-[10px] rounded-br-[10px] gap-2 px-5 py-[8px] text-[15px] hover:bg-gray-100`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24"
                        width="24"
                        viewBox="0 0 640 640"
                      >
                        <path
                          fill="#4A4947"
                          d="M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L513.1 479.4C530.6 476.1 543.9 460.7 543.9 442.3C543.9 435.6 542.1 429 538.8 423.3L517 385.7C498 353.1 488 316.1 488 278.4L488 263.9C488 179.3 425.4 109.2 344 97.6L344 87.9C344 74.6 333.3 63.9 320 63.9C306.7 63.9 296 74.6 296 87.9L296 97.6C253.8 103.6 216.6 125.4 190.6 156.7L73 39.1zM224.8 190.9C246.7 162.4 281.2 144 320 144C386.3 144 440 197.7 440 264L440 278.5C440 324.7 452.3 370 475.5 409.9L488.4 432L465.8 432L224.7 190.9zM164.5 409.9C184 376.5 195.8 339.2 199.1 300.9L152.4 254.2C152.2 257.5 152.1 260.8 152.1 264.1L152.1 278.6C152.1 316.3 142.1 353.3 123.1 385.9L101.1 423.2C97.7 429 96 435.5 96 442.2C96 463.1 112.9 480 133.8 480L378.2 480L330.2 432L151.6 432L164.5 409.9zM252.1 528C262 556 288.7 576 320 576C351.3 576 378 556 387.9 528L252.1 528z"
                        />
                      </svg>
                      <span>Nunca</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => community && handleJoinCommunity(community)}
              className={`rounded-full border border-gray-300 cursor-pointer px-4 py-[6px] Dosis-Bold hover:bg-gray-100 ${
                community?.creator_id === user?.id
                  ? "bg-red"
                  : community?.isMember
                  ? ""
                  : "bg-blue"
              }`}
            >
              <span
                className={`text-[15px] ${
                  community?.creator_id === user?.id
                    ? "text-white"
                    : community?.isMember
                    ? "text5"
                    : "text-white"
                }`}
              >
                {community?.creator_id === user?.id
                  ? "Eres el moderador"
                  : community?.isMember
                  ? "Se unió"
                  : "Unirse"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/** Posts de la comunidad */}
      <div className="flex gap-8 justify-between w-full flex-wrap mt-30">
        <div className="flex flex-col flex-[2] px-5">
          {Array.isArray(communityPosts) && communityPosts.length > 0 ? (
            communityPosts.map((post: Posts, index) => (
              <div key={post.id} className="w-full">
                <PostCard Post={post} isDashboard={false} />
                {index < communityPosts.length - 1 && (
                  <div className="w-full h-[1px] mx-auto bg-[#4A4947] my-1" />
                )}
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
                <Loader color="gray-500" size="12" />
                <span className="text-sm">Cargando más posts...</span>
              </div>
            )}

            {!hasNextPage && communityPosts.length > 0 && (
              <div className="text-sm text5">No hay más posts para mostrar</div>
            )}
          </div>
        </div>

        {/* Información de la comunidad */}
        {community && <CommunityInfo community={community} isCommunity={true} />}
      </div>
    </section>
  );
};

export default UCommunity;
