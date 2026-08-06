import { ROUTES } from "@/api/constants/constants";
import Loader from "@/components/ui/feedback/Loader";
import { useUserRecipes } from "@/hooks/api/recipe/useRecipe";
import type { Recipe } from "@/interface/global";
import { capitalize } from "@/utils/capitalize";
import { ChartBar, Clock, Plus, ShoppingCart, Star, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  onClose: () => void;
  recipe?: Recipe;
  onSelectRecipe: (recipe: Recipe) => void;
}

export default function RecipeSideModal({
  onClose,
  onSelectRecipe,
  recipe,
}: Props) {
  const navigate = useNavigate();

  const [search, setSearch] = useState<string>("");

  const { data: recipes, isLoading } = useUserRecipes();

  let filtered = useMemo(() => {
    if (!recipes) return [];

    return recipes.data?.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [recipes, search]);

  return (
    <section className="flex flex-1 flex-col gap-y-6">
      <header className="flex flex-row gap-x-4 justify-start items-center">
        <button
          type="button"
          className="cursor-pointer transition-all rounded-full p-1.5 hover:bg-gray-200 duration-200"
          onClick={() => {
            onClose();
          }}
        >
          <X size={18} color="#2F2F2F" />
        </button>
        <h2 className="font-bold text-lg text-text-3">Tus recetas</h2>
      </header>

      <div className="flex flex-wrap flex-row items-center px-4 border border-gray-100 rounded-full gap-x-4">
        <svg width={18} height={18} viewBox="0 0 640 640">
          <path
            fill="#4A4947"
            d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z"
          />
        </svg>
        <input
          className="flex-1 text-sm placeholder:text-text-6 outline-none py-1.5"
          spellCheck
          value={search}
          placeholder="Buscar receta por nombre..."
          onChange={(e) => setSearch(e.target.value)}
          type="text"
        />
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader size={24} color="#e5a657" />
        </div>
      ) : filtered && filtered.length > 0 ? (
        <section className="flex-1 flex flex-col gap-y-2 overflow-y-auto">
          {filtered.map((item: Recipe) => {
            let rating: number = 0;

            if (item) {
              const total_votes = (item.votes_down || 0) + (item.votes_up || 0);
              rating =
                total_votes > 0 ? ((item.votes_up || 0) / total_votes) * 5 : 0;
            }

            const isSelected = item.id === recipe?.id;
            return (
              <button
                onClick={() => onSelectRecipe(item)}
                className={`flex cursor-pointer  flex-row gap-x-4 items-center p-3 rounded-lg mb-2 border ${
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
          })}
        </section>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <span className="text-sm text-text-3">
            No tienes recetas publicadas con ese nombre
          </span>
        </div>
      )}

      <footer>
        <button
          type="button"
          className="flex cursor-pointer justify-center w-full flex-row border border-dashed border-[#e5a657] items-center px-4 gap-x-2 py-2 rounded-[5px]"
          onClick={() => {
            onClose();
            navigate(ROUTES.USER.CREATE_RECIPE);
          }}
        >
          <Plus size={20} color="#e5a657" />
          <span className="text-sm font-semibold text-3">Crear receta</span>
        </button>
      </footer>
    </section>
  );
}