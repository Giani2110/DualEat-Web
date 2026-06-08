import type { Ingredient } from "@/interface/global";
import { capitalize } from "@/utils/capitalize";
import { Loader, Trash } from "lucide-react";
import { useMemo, useState } from "react";

interface Props {
  ingredients: Ingredient[];
  isLoading: boolean;
  onSelectIngredient: (ingredient: Ingredient) => void;
  ingredientsIds?: Ingredient[];
  setIngredientsIds?: (ingredientsIds: Ingredient[]) => void;
}

export default function IngredientsModal({
  ingredients,
  ingredientsIds,
  onSelectIngredient,
  setIngredientsIds,
  isLoading,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIngredients = useMemo(() => {
    if (!searchQuery) return ingredients;

    const lowerCaseQuery = searchQuery.toLowerCase();
    return ingredients.filter((item) =>
      item.name.toLowerCase().includes(lowerCaseQuery),
    );
  }, [ingredients, searchQuery]);

  return (
    <section className="flex flex-1 flex-col gap-y-6">
      <div className="flex flex-wrap flex-row items-center px-4 border border-gray-100 rounded-full gap-x-4">
        <svg width={18} height={18} viewBox="0 0 640 640">
          <path
            fill="#4A4947"
            d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z"
          />
        </svg>
        <input
          className="flex-1 placeholder:text-text-6 outline-none py-1.5"
          spellCheck
          maxLength={100}
          value={searchQuery}
          placeholder="¿Qué ingredientes tienes?"
          onChange={(e) => setSearchQuery(e.target.value)}
          type="text"
        />
      </div>
      {ingredientsIds && ingredientsIds.length > 0 && setIngredientsIds && (
        <button
          onClick={() => setIngredientsIds([])}
          className="w-full cursor-pointer group hover:bg-bg-red transition-colors duration-200 flex items-center justify-center border border-bg-red rounded-[5px] py-1.5 gap-x-2"
        >
          <Trash size={20} className="group-hover:text-text-1 text-bg-red" />
          <span className="group-hover:text-text-1 text-bg-red font-outfit-light text-[14px]">
            Eliminar Ingredientes
          </span>
        </button>
      )}

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader size={24} color="#e5a657" />
        </div>
      ) : ingredients ? (
        <section className="flex-1 flex flex-col gap-y-2 overflow-y-auto">
          {filteredIngredients.map((ingredient: Ingredient) => {
            const isSelected = ingredientsIds?.some(
              (item) => item.id === ingredient.id,
            );
            return (
              <button
                key={ingredient.id}
                style={{
                  borderColor: isSelected ? "#3578e4" : "#dbdbdb",
                  backgroundColor: isSelected ? "#e7f0fd" : "transparent",
                }}
                onClick={() => {
                  onSelectIngredient(ingredient);
                }}
                className="flex flex-row items-center cursor-pointer px-4 py-2 border border-[#dbdbdb] rounded-[5px] gap-x-2 hover:bg-gray-100 transition-all duration-200"
              >
                <span className="font-outfit-light  text-center text-[14px] ">
                  {capitalize(ingredient.name)}
                </span>
              </button>
            );
          })}
        </section>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <span className="font-outfit-light text-[16px]">
            No se encontraron ingredientes
          </span>
        </div>
      )}
    </section>
  );
}
