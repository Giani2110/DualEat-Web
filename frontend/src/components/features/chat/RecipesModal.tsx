import type { ChatSession, Recipe } from "@/interface/global";
import { updateRecipe } from "@/services/chat.api";
import { getRecipeById, searchRecipes } from "@/services/recipe.api";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import {
  Search,
  Star,
  Clock,
  ShoppingCart,
  ChartBar,
  X,
} from "lucide-react";
import { capitalize } from "@/utils/capitalize";
import { useInView } from "react-intersection-observer";
import Loader from "@/components/ui/feedback/Loader";

interface RecipesModalProps {
  chat: ChatSession;
  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  query: string | null;
  setQuery: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function RecipesModal({
  chat,
  recipes,
  setRecipes,
  query,
  setQuery,
}: RecipesModalProps) {
  const queryClient = useQueryClient();

  const [localQuery, setLocalQuery] = useState<string>(query || "");

  const { ref, inView } = useInView({
    rootMargin: "200px",
  });

  const {
    data: recipesSearch,
    isFetchingNextPage,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["recipes_search", query],

    queryFn: async ({ pageParam = 1 }) => {
      console.log(
        "Iniciando búsqueda en la API. Query:",
        query,
        "| Página:",
        pageParam,
      );
      try {
        const response = await searchRecipes(
          query as string,
          pageParam as number,
        );
        console.log(
          "Respuesta de la API de búsqueda:",
          JSON.stringify(response.data, null, 2),
        );

        if (!response?.success || !response?.data) {
          throw new Error(
            response.message || "No se encontraron recetas con ese nombre",
          );
        }

        return response;
      } catch (error) {
        console.error("Error dentro de queryFn al buscar recetas:", error);
        throw error;
      }
    },

    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.hasMore) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,

    enabled: !!query,
    refetchOnMount: true,
    refetchOnWindowFocus: true,

    staleTime: 1000 * 60 * 20,
    gcTime: 1000 * 60 * 60,
    retry: 3,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const dataFlatMap = useMemo(() => {
    if (!query) {
      return recipes.filter((recipe) => recipe.id !== chat?.recipe_id);
    }
    return (
      recipesSearch?.pages
        .flatMap((page) => page?.data || [])
        .filter((recipe) => recipe.id !== chat?.recipe_id) || []
    );
  }, [recipesSearch, chat, recipes, query]);

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const { data: recipePinned } = useQuery({
    queryKey: ["recipe", chat?.recipe_id],
    queryFn: async () => {
      const response = await getRecipeById(chat?.recipe_id as string);
      if (!response.success || !response.data) {
        throw new Error("No se pudo obtener la receta vinculada");
      }
      return response.data as Recipe;
    },
    enabled: !!chat?.recipe_id,
  });

  const handleSelectRecipe = (item: Recipe) => {
    setSelectedRecipe(item);
  };

  const { mutate } = useMutation({
    mutationFn: async ({ recipe_id }: { recipe_id: string | null }) => {
      const response = await updateRecipe(
        chat.chat_id as string,
        recipe_id as string,
      );

      console.log(
        "CHAT ACTUALIZADO DESDE API: ",
        JSON.stringify(response.data, null, 2),
      );
      return response;
    },
    onMutate: () => {
      queryClient.cancelQueries({ queryKey: ["chat", chat.chat_id] });
      const previous = queryClient.getQueryData(["chat", chat.chat_id]);

      queryClient.setQueryData(["chat", chat.chat_id], (prev: ChatSession) => ({
        ...prev,
        recipe_id: selectedRecipe?.id,
      }));

      return {
        previous,
        selectedRecipe,
        chat_id: chat.chat_id,
      };
    },
    onSuccess: () => {
      setSelectedRecipe(null);
    },
    onError: (error, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["chat", context.chat_id], context.previous);
      }
    },
  });

  return (
    <div className="flex flex-col flex-1 h-full max-h-[85vh]">
      {/* Barra de búsqueda */}
      <div className="flex flex-row items-center px-4 border border-gray-200 rounded-full gap-x-3 bg-white mb-4 shadow-sm focus-within:border-[#e5a657] focus-within:ring-1 focus-within:ring-[#e5a657] transition-all">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              console.log(e.currentTarget.value);
              setQuery(e.currentTarget.value);
            }
          }}
          placeholder="Buscar receta por nombre..."
          className="flex-1 outline-none py-2 text-sm text-[#4a4947] bg-transparent"
        />
        {localQuery && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setLocalQuery("");
            }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={14} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* Contenedor con scroll */}
      <section className="flex-1 overflow-y-auto pr-1 flex flex-col gap-y-4">
        {chat?.recipe_id && recipePinned && (
          <div className="mb-2">
            <span className="font-bold text-sm text-text-3 block mb-2">
              Receta vinculada
            </span>
            <div className="flex flex-col gap-y-2 p-3">
              <div className="relative w-full overflow-hidden rounded-[10px]">
                <div className="absolute inset-0 blur-md scale-150 brightness-30 z-0 overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${recipePinned.main_image || "https://placehold.co/600x400"})`,
                    }}
                  />
                </div>
                <div className="relative z-10">
                  <img
                    src={
                      recipePinned.main_image || "https://placehold.co/600x400"
                    }
                    alt={recipePinned.name}
                    className="w-full h-40 rounded-lg object-contain shrink-0"
                  />
                </div>
              </div>


            
                <span className="font-bold text-lg text-text-3 truncate">
                  {recipePinned.name}
                </span>
                <span className="text-sm text-text-5 line-clamp-6">
                  {recipePinned.description}
                </span>

               

                    <div className="flex flex-row items-center gap-x-4">
                      <div className="flex flex-row items-center gap-x-1">
                        <Clock size={16} color="#707070" />
                        <span className="text-xs text-text-4">
                          {recipePinned.total_time || 0}min
                        </span>
                      </div>

                      <div className="flex flex-row items-center gap-x-1">
                        <ShoppingCart size={16} color="#707070" />

                        <span className="text-xs text-text-4">
                          {recipePinned._count?.ingredients || 0} ingredientes
                        </span>
                      </div>
                      <div className="flex flex-row items-center gap-x-1">
                        <ChartBar size={16} color="#707070" />

                        <span className="text-xs text-text-4">
                          {recipePinned._count?.steps || 0} pasos
                        </span>
                      </div>
                    </div>
               
            
            </div>
          </div>
        )}

        {/* Listado de recetas */}
        <div className="flex flex-col gap-y-2 flex-1">

          {isLoading ? (
            <div className="flex h-full flex-row items-center justify-center">
              <Loader size={16} color="#707070" />
            </div>
          ) : dataFlatMap.length > 0 ? (
            dataFlatMap.map((item) => {
              let rating: number = 0;

              if (item) {
                const total_votes =
                  (item.votes_down || 0) + (item.votes_up || 0);
                rating =
                  total_votes > 0
                    ? ((item.votes_up || 0) / total_votes) * 5
                    : 0;
              }

              const isSelected = item.id === selectedRecipe?.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectRecipe(item)}
                  className={`flex cursor-pointer flex-row gap-x-4 items-center p-3 rounded-lg mb-2 border ${
                    isSelected
                      ? "border-bg-blue bg-[#e7f0fd]"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={item.main_image}
                    className="w-8 h-full rounded-[5px] object-cover"
                  />

                  <div className="flex-1 flex flex-col gap-y-1.5">
                    <div className="flex flex-row justify-between">
                      <span
                        style={{ flexShrink: 1 }}
                        className="font-bold text-base text-text-3"
                      >
                        {item.name}
                      </span>
                      <div className="flex flex-row items-center gap-x-1">
                        <Star size={14} fill="#e5a657" color="#e5a657" />

                        <span className="font-bold text-[12px] text-text-3">
                          {rating === 0 ? "N/A" : `${rating.toFixed(1)}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-row items-center gap-x-4">
                      <div className="flex flex-row items-center gap-x-1">
                        <Clock size={16} color="#707070" />
                        <span className="text-xs text-text-4">
                          {item.total_time || 0}min
                        </span>
                      </div>

                      <div className="flex flex-row items-center gap-x-1">
                        <ShoppingCart size={16} color="#707070" />

                        <span className="text-xs text-text-4">
                          {item._count?.ingredients || 0} ingredientes
                        </span>
                      </div>
                      <div className="flex flex-row items-center gap-x-1">
                        <ChartBar size={16} color="#707070" />

                        <span className="text-xs text-text-4">
                          {item._count?.steps || 0} pasos
                        </span>
                      </div>
                    </div>

                    <span className="text-text-4 text-left text-sm line-clamp-3">
                      {capitalize(item.description)}
                    </span>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-10">
              <span className="text-center text-text-4 text-sm font-outfit-light">
                No se encontraron recetas
              </span>
            </div>
          )}
        </div>

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
        </div>
      </section>

      {/* Botones de acción fijos abajo */}
      {chat && (
        <div className="border-t border-gray-200 bg-white flex flex-row justify-around gap-x-3 pt-4 mt-2">
          <button
            type="button"
            disabled={!selectedRecipe}
            onClick={() => {
              if (selectedRecipe) {
                mutate({ recipe_id: selectedRecipe.id });
              }
            }}
            className={`flex-1 py-2.5 rounded-full justify-center items-center text-sm font-bold transition-all duration-200 ${
              selectedRecipe
                ? "bg-[#3578e4] hover:bg-[#2860b2] text-white cursor-pointer"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Vincular Receta
          </button>

          {chat.recipe_id && (
            <button
              type="button"
              onClick={() => {
                mutate({ recipe_id: null });
              }}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-full justify-center items-center text-sm font-bold cursor-pointer transition-all duration-200"
            >
              Desvincular
            </button>
          )}
        </div>
      )}
    </div>
  );
}