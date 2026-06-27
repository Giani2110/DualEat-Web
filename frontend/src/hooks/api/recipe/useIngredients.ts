import localforage from "localforage";
import { useQuery } from "@tanstack/react-query";
import type { Ingredient } from "@/interface/global";
import { getAllIngredients } from "@/services/recipe.api";

export const INGREDIENTS_CACHE_KEY = "@ingredients_data";

export const useIngredients = (open: boolean) => {
  return useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      try {
        const cached = await localforage.getItem<Ingredient[]>(
          INGREDIENTS_CACHE_KEY,
        );

        if (cached) {
          return cached;
        }

        const response = await getAllIngredients();

        if (!response?.success || !response?.data) {
          throw new Error("Error obteniendo los ingredientes del servidor");
        }

        const array = response.data as Ingredient[];
        const sorted = array.sort((a, b) => a.name.localeCompare(b.name));

        await localforage.setItem(INGREDIENTS_CACHE_KEY, sorted);

        return sorted;
      } catch (e) {
        console.log("Error en useIngredients:", e);
        throw e;
      }
    },
    enabled: !!open,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
  });
};
