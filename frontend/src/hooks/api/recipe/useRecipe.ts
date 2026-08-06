import { getUserRecipes } from "@/services/recipe.api";
import { useQuery } from "@tanstack/react-query";

// useUserRecipes (GET)
//==============================================
export const useUserRecipes = () => {
  return useQuery({
    queryKey: ["user_recipes"],
    queryFn: async () => {
      try {
        const response = await getUserRecipes();

        if (!response.success) {
          throw new Error(response.message || "Error al obtener las recetas");
        }
        return response;
      } catch (e: any) {
        throw e;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
  });
};