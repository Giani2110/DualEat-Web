import type { Ingredient } from "@/interface/global";
import { capitalize } from "@/utils/capitalize";
import {
  ArrowUp,
  Beef,
  BookDashed,
  BookOpenText,
  FileQuestionMark,
  Search,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";

type SearchInputBarProps = {
  handleSearch: () => void;
  type: "ask" | "recipe" | "ingredient";
  setType: (type: "ask" | "recipe" | "ingredient") => void;
  recipeSelected: { name: string } | null;
  started: boolean;
  search: string;
  setSearch: (value: string) => void;
  filteredIngredients: Ingredient[];
  includedIngredients: number[];
  setIncludedIngredients: (value: number[]) => void;
};

const SearchInputBar: React.FC<SearchInputBarProps> = ({
  handleSearch,
  type,
  setType,
  recipeSelected,
  started,
  search,
  setSearch,
  filteredIngredients,
  includedIngredients,
  setIncludedIngredients
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const focusInput = () => {
    inputRef.current?.focus();
  };
  

  const handleToggle = (type: "ask" | "recipe" | "ingredient") => {
    if (type === "ingredient") {
      setType("ingredient");
      toast("Cambiando a busqueda por ingredientes", {
        icon: "🍖",
        duration: 1500,
      });
    } else if (type === "recipe") {
      setType("recipe");
      toast("Cambiando a busqueda por nombre", {
        icon: "🔍",
        duration: 1500,
      });
    } else {
      setType("ask");
      toast("Cambiando a busqueda por pregunta", {
        icon: "🧠",
        duration: 1500,
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);
  return (
    <div
      onClick={focusInput}
      className={`w-full mt-7 relative flex gap-2 px-4 py-2 border border-gray-300 rounded-[10px] hover:shadow-md cursor-text
          ${
            !started
              ? "max-w-[900px] flex-col"
              : "flex-row justify-between items-center"
          }
            flex-wrap`}
    >
      {/* Input de búsqueda con placeholder dinámico */}
      <input
        ref={inputRef}
        type="text"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
            setSearch("");
            setShowDropdown(false);
          }
        }}
        onChange={(e) => {
          setSearch(e.target.value);
          setShowDropdown(true);
        }}
        placeholder={`${
          recipeSelected?.name
            ? `Alguna pregunta sobre ${recipeSelected?.name}?`
            : type === "ingredient"
            ? "Buscar recetas por ingredientes"
            : type === "recipe"
            ? "Buscar recetas por nombre"
            : "Realiza una consulta"
        }...`}
        className={`outline-none flex-[3] ps-3 placeholder:text-[#707070] ${
          !started && "pt-2"
        } placeholder:text-[16px] w-full text5`}
        value={search}
      />

      {/* CONTROLES DE BÚSQUEDA - Botones de tipo y búsqueda */}
      <div
        className={`flex ${!started && "justify-end flex-[1] w-full"} gap-4`}
      >
        {/* Selector de tipo de búsqueda con menú desplegable */}
        <div
          onClick={() => setOpen(!open)}
          className={`relative bg-[#f5f5f5] p-2 rounded-full border-2 border-[#b53325] hover:shadow-md cursor-pointer`}
        >
          {/* Icono dinámico según el tipo seleccionado */}
          {recipeSelected ? (
            <FileQuestionMark stroke="#b53325" size={22} />
          ) : type === "ingredient" ? (
            <Beef stroke="#b53325" size={22} />
          ) : type === "recipe" ? (
            <BookOpenText stroke="#b53325" size={22} />
          ) : (
            <BookDashed stroke="#b53325" size={22} />
          )}

          {/* Menú desplegable de tipos de búsqueda */}
          {open && (
            <div
              className={`absolute -top-18 right-0 bg-[#f5f5f5] border border-[#dbdbdb] z-50 flex items-center gap-1 p-2 rounded-lg shadow-md`}
            >
              <button
                type="button"
                onClick={() => handleToggle("ask")}
                title="Modo pregunta"
                className="p-3 bg-[#2F2F2F] text-white rounded-full cursor-pointer"
              >
                <BookDashed size={20} />
              </button>
              <button
                type="button"
                onClick={() => handleToggle("recipe")}
                title="Modo receta"
                className="p-3 bg-[#2F2F2F] text-white rounded-full cursor-pointer"
              >
                <BookOpenText size={20} />
              </button>
              <button
                type="button"
                onClick={() => handleToggle("ingredient")}
                title="Modo ingrediente"
                className="p-3 bg-[#2F2F2F] text-white rounded-full cursor-pointer"
              >
                <Beef size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Botón de búsqueda/envío */}
        <button
          title="Buscar"
          type="button"
          onClick={() => {
            if (search) {
              handleSearch();
              setSearch("");
              setShowDropdown(false);
            }
          }}
          className={`cursor-pointer ${"bg-[#b53325] rounded-[60px] p-[10px]"}`}
        >
          {/* Icono dinámico: flecha si hay texto, lupa si no hay */}
          {search ? (
            <ArrowUp size={20} color="#ffffff" />
          ) : (
            <Search size={20} color="#ffffff" />
          )}
        </button>
      </div>

      {/* DROPDOWN DE INGREDIENTES - Solo visible en modo ingrediente */}
      {type === "ingredient" && search && showDropdown && (
        <div
          ref={dropdownRef}
          className={`flex flex-col mt-5 absolute ${
            !started
              ? "-bottom-[160px] max-w-[700px]"
              : "bottom-[130px] max-w-[900px]"
          } h-fit bg-white w-full max-h-35 overflow-y-auto shadow-md rounded-b-[10px]`}
        >
          {/* Lista de ingredientes filtrados */}
          {filteredIngredients.map((ingredient) => (
            <div
              key={ingredient.id}
              onClick={() => {
                // Evita duplicados
                if (includedIngredients.includes(ingredient.id)) return;
                setIncludedIngredients([...includedIngredients, ingredient.id]);
              }}
              className="px-3 py-2 cursor-pointer hover:bg-gray-50 text-[15px] text5 border-b border-gray-100 last:border-b-0"
            >
              {capitalize(ingredient.name)}
            </div>
          ))}
        </div>
      )}
    </div>

    
  );
};

export default SearchInputBar;
