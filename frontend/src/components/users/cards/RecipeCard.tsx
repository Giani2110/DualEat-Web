import React from "react";
import { Clock, Beef, ChefHat } from "lucide-react";
import type { Recipe } from "@interface/global";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface RecipeCardProps {
  recipe: Recipe;
  RecipeFocus: (recipe: Recipe) => void;
  isSelected: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  RecipeFocus,
  isSelected,
}) => {
  const navigate = useNavigate();
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}min`
      : `${hours}h`;
  };

  const handleCardClick = () => {
    RecipeFocus(recipe);
    toast("Receta seleccionada", {
      icon: "🍔",
      duration: 1000,
    });
  };

  return (
    <div
      className={`bg-[hsl(0,0%,98%)] mb-2 rounded-[10px] shadow-sm hover:shadow-md overflow-hidden cursor-pointer group ${
        isSelected ? "border-[#b53325] border-2" : "border border-gray-300"
      }`}
      onClick={handleCardClick}
    >
      <div className="flex p-3 gap-3">
        {/* Imagen */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <img
            src={
              recipe.main_image ? recipe.main_image : "https://placehold.co/400"
            }
            alt={recipe.name}
            className="w-full h-full rounded-[5px] object-cover"
          />
        </div>

        {/* Contenido */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-red text-sm line-clamp-2 mb-1">
              {recipe.name}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {recipe.description ? recipe.description : "Sin descripción"}
            </p>
            <button
              type="button"
              className="text-xs text1 mt-2 bg-red p-[5px] w-full rounded-full cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigate(
                  `/c/${recipe.posts[0].community.slug}/recipe/${recipe.user.slug}/${recipe.slug}`
                );
              }}
            >
              <span className="text-xs">Ver Receta</span>
            </button>
          </div>

          {/* Estadísticas */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={14} strokeWidth={2} className="text-red" />
                <span>
                  {recipe.total_time > 0
                    ? formatTime(recipe.total_time)
                    : "N/A"}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs text-gray-500">
                <ChefHat size={14} strokeWidth={2} className="text-red" />
                <span>{recipe.steps.length} pasos</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Beef size={14} strokeWidth={2} className="text-red" />
              <span>{recipe.ingredients.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
