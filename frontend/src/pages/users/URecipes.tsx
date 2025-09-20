import { useState, useRef, useEffect } from "react";
import UIDashboard from "../../components/users/UIDashboard";
import { getAllIngredients } from "../../services/recipes.api";
import { useAuth } from "../../hooks/useAuth";
import { capitalize } from "../../utils/capitalize";

import toast from "react-hot-toast";

import { Beef, Search, ArrowUp, Trash2 } from "lucide-react";
import type { Ingredient } from "../../interface/global";

const URecipes = () => {
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>(
    []
  );

  const [includedIngredients, setIncludedIngredients] = useState<number[]>([]);

  //const [recipes, setRecipes] = useState<Recipe[]>([]);

  const [boolean, setBoolean] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const fetchIngredients = async () => {
    const ingredients = await getAllIngredients();
    if (ingredients && ingredients.success) {
      setIngredients(ingredients.data as Ingredient[]);
    }
  };

  const handleToggle = () => {
    setBoolean(!boolean);
    if (boolean) {
      toast("Cambiando a busqueda por ingredientes", {
        icon: "🍖",
        duration: 1500,
      });
    } else {
      toast("Cambiando a busqueda por nombre", {
        icon: "🔍",
        duration: 1500,
      });
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  useEffect(() => {
    if (boolean) {
      const removeAccents = (str: string) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      };
      const filtered = ingredients.filter((ingredient) => {
        return removeAccents(ingredient.name)
          .toLowerCase()
          .includes(removeAccents(search).toLowerCase());
      });
      setFilteredIngredients(filtered);
    } else {
      setIncludedIngredients([]);
      setFilteredIngredients([]);
    }
  }, [boolean, search, ingredients]);

  return (
    <UIDashboard>
      <section className="mt-10 flex flex-wrap flex-col justify-center h-[70vh] items-center w-full">
        <div className="mb-1 w-full max-w-[800px] leading-11">
          <h1 className="text-[32px] text5 font-bold">
            Hola, {capitalize(user?.name || "Usuario")}
          </h1>
          <h1 className="text-[32px]  text5 font-bold">
            ¿En qué puedo ayudarte?
          </h1>
          <p className="pt-2 text5 text-[17px] Dosis-Light tracking-tight">
            Elija una de las sugerencias a continuación o escriba la suya para
            comenzar a chatear con Ollama.
          </p>
        </div>

        {includedIngredients.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6 w-full max-w-[900px] max-h-[68px] overflow-y-auto items-center justify-center">
            {expanded
              ? includedIngredients.map((id) => {
                  const ingredient = ingredients.find((ing) => ing.id === id);
                  return (
                    <div
                      key={ingredient?.id}
                      onClick={() => {
                        setIncludedIngredients(
                          includedIngredients.filter((ing) => ing !== id)
                        );
                      }}
                      className="flex gap-2 cursor-pointer items-center justify-between bg-red text1 rounded-full px-3 py-1 text-[14px] shrink-0"
                    >
                      <span>{capitalize(ingredient?.name || "")}</span>
                      <button
                        aria-label="Eliminar ingrediente"
                        title="Eliminar ingrediente"
                        type="button"
                        className="cursor-pointer"
                      >
                        <Trash2 size={15} color="#ffffff" />
                      </button>
                    </div>
                  );
                })
              : includedIngredients.slice(0, 3).map((id) => {
                  const ingredient = ingredients.find((ing) => ing.id === id);
                  return (
                    <div
                      key={ingredient?.id}
                      onClick={() => {
                        setIncludedIngredients(
                          includedIngredients.filter((ing) => ing !== id)
                        );
                      }}
                      className="flex gap-2 cursor-pointer items-center justify-between bg-red text1 rounded-full px-3 py-1 text-[12px] shrink-0"
                    >
                      <span className="text-[14px]">
                        {capitalize(ingredient?.name || "")}
                      </span>
                      <button
                        aria-label="Eliminar ingrediente"
                        title="Eliminar ingrediente"
                        type="button"
                        className="cursor-pointer"
                      >
                        <Trash2 size={15} color="#ffffff" />
                      </button>
                    </div>
                  );
                })}

            {includedIngredients.length > 3 && (
              <div
                typeof="button"
                title="Ver más"
                aria-label="Ver más"
                onClick={() => setExpanded(!expanded)}
                className="flex items-center justify-center cursor-pointer bg-yellow text1 rounded-full px-3 py-1 text-[14px] shrink-0"
              >
                {expanded ? "Ver menos" : `+${includedIngredients.length - 3}`}
              </div>
            )}
          </div>
        )}

        <div
          onClick={focusInput}
          className="w-full mt-7 relative max-w-[800px] justify-between px-4 items-center py-2 border border-gray-300 rounded-[10px] flex-wrap flex flex-col gap-2 hover:shadow-md cursor-text"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder={`${
              boolean
                ? "Buscar recetas por ingredientes"
                : "Buscar recetas por nombre"
            }...`}
            className="outline-none flex-[3] ps-3 placeholder:text-[#707070] pt-2 placeholder:text-[16px] w-full text5"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="flex justify-end w-full gap-5">
            <button
              title="Buscar por ingredientes"
              onClick={() => handleToggle()}
              type="button"
              className={`cursor-pointer transition duration-300  border-2 border-[#b53325] p-1 rounded-[10px] 
              ${
                boolean
                  ? "bg-white hover:bg-gray-200"
                  : "border-dashed bg-gray-200 hover:bg-gray-300"
              }
              `}
            >
              <Beef size={20} color={`${boolean ? "#b53325" : "#707070"}`} />
            </button>

            <button
              title="Buscar"
              type="button"
              className={`cursor-pointer ${
                !boolean && search ? "bg-[#b53325] rounded-[60px] p-[6px]" : ""
              }`}
            >
              {!boolean && search ? (
                <ArrowUp size={20} color="#ffffff" />
              ) : (
                <Search size={20} color="#707070" />
              )}
            </button>
          </div>
          {boolean && search && (
          <div className="flex flex-col mt-5 absolute -bottom-[160px] max-w-[700px] h-fit bg-white w-full max-h-35 overflow-y-auto shadow-md rounded-b-[10px]">
            {filteredIngredients.map((ingredient) => (
              <div
                key={ingredient.id}
                onClick={() => {
                  if (includedIngredients.includes(ingredient.id)) return;
                  setIncludedIngredients([
                    ...includedIngredients,
                    ingredient.id,
                  ]);
                }}
                className="px-3 py-2 cursor-pointer hover:bg-gray-50 text-[15px] text5 border-b border-gray-100 last:border-b-0"
              >
                {capitalize(ingredient.name)}
              </div>
            ))}
          </div>
        )}
        </div>
        
      </section>
    </UIDashboard>
  );
};

export default URecipes;
