import { useState, useRef, useEffect } from "react";
import { getAllIngredients } from "../../services/recipes.api";
import { useAuth } from "../../hooks/useAuth";
import { capitalize } from "../../utils/capitalize";

import {
  askOllama,
  askRecipe,
  getUserRecipes,
} from "../../services/recipes.api";

import toast from "react-hot-toast";
import RecipeCard from "../../components/users/RecipeCard";

import {
  Beef,
  Search,
  ArrowUp,
  Trash2,
  BookOpenText,
  BookDashed,
  FileQuestionMark,
} from "lucide-react";

import type {
  Ingredient,
  Recipe,
  PaginationInfo,
} from "../../interface/global";

import Loader from "../../components/animation/Loader";

// INTERFACES LOCALES
interface Comment {
  text: string;
  role: "user" | "ai";
}

const URecipes = () => {
  // ESTADOS DE PAGINACIÓN Y BÚSQUEDA
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [search, setSearch] = useState("");
  const { user } = useAuth();

  // ESTADOS DE INGREDIENTES
  // Lista completa de ingredientes disponibles
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>(
    []
  );
  // IDs de ingredientes seleccionados para búsqueda
  const [includedIngredients, setIncludedIngredients] = useState<number[]>([]);

  // ESTADOS DE RECETAS Y TIPO DE BÚSQUEDA
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [type, setType] = useState<"ask" | "recipe" | "ingredient">("ask");

  // ESTADOS DE UI Y INTERACCIÓN
  // Control del menú desplegable de tipos de búsqueda
  const [open, setOpen] = useState(false);
  // Control de expansión de la lista de ingredientes seleccionados
  const [expanded, setExpanded] = useState(false);
  // Control del dropdown de ingredientes filtrados
  const [showDropdown, setShowDropdown] = useState(false);

  // REFERENCIAS DOM
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ESTADOS DE CARGA Y ERROR
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ESTADOS DE CONVERSACIÓN Y CHAT
  const [conversation, setConversation] = useState<Comment[]>([]);
  // Índice del mensaje expandido en el chat (para mostrar texto completo)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const [recipeSelected, setRecipeSelected] = useState<Recipe | null>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  // FUNCIONES DE API
  const fetchIngredients = async () => {
    const ingredients = await getAllIngredients();
    if (ingredients && ingredients.success) {
      setIngredients(ingredients.data as Ingredient[]);
    }
  };

  // Busca recetas usando el servicio de IA con paginación
  const searchRecipes = async (
    page: number = 1,
    isLoadMore: boolean = false
  ) => {
    if (!search.trim()) return;

    // Maneja estados de carga según si es búsqueda inicial o cargar más
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setIsLoading(true);
      setPagination(null);
    }

    // Marca que la conversación ha comenzado y añade mensaje del usuario
    setStarted(true);
    setConversation((prev) => [...prev, { text: search, role: "user" }]);
    setRecipes([]);

    try {
      // Llama al servicio de IA con los parámetros de búsqueda
      if (type === "ingredient") {
        setSearch("");
      }
      const response = await askOllama(search, type, includedIngredients, page);

      if (response?.success && response.comment) {
        // Procesa la respuesta de la IA (puede ser string o array)
        const aiResponses: Comment[] = Array.isArray(response.comment)
          ? response.comment.map((c: Comment) => ({
              text: c.text,
              role: "ai",
            }))
          : [{ text: response.comment, role: "ai" }];

        // Añade respuestas de IA al historial
        setConversation((prev) => [...prev, ...aiResponses]);

        // Actualiza recetas (acumula si es "cargar más", reemplaza si es nueva búsqueda)
        setRecipes((prev) =>
          isLoadMore
            ? [...prev, ...(response.data as Recipe[])]
            : (response.data as Recipe[])
        );

        // Actualiza información de paginación
        if (response.pagination) {
          setPagination(response.pagination as PaginationInfo);
        }
      }
    } catch (err) {
      setError("Perdón, no pudimos responder tu pregunta. Intenta nuevamente.");
      console.log(err);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  // Analiza una receta específica seleccionada con una pregunta
  const analizeRecipe = async () => {
    if (!search.trim() || !recipeSelected) return;

    setIsLoading(true);
    setConversation((prev) => [...prev, { text: search, role: "user" }]);

    try {
      // Llama al servicio específico para analizar recetas
      const response = await askRecipe(search, recipeSelected.id);
      if (response?.success && response.comment) {
        // Procesa respuesta de IA similar a searchRecipes
        const aiResponses: Comment[] = Array.isArray(response.comment)
          ? response.comment.map((c: Comment) => ({
              text: c.text,
              role: "ai",
            }))
          : [{ text: response.comment, role: "ai" }];

        setConversation((prev) => [...prev, ...aiResponses]);
      }
    } catch (err) {
      setError("Perdón, no pudimos responder tu pregunta. Intenta nuevamente.");
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  // HANDLERS DE EVENTOS
  // Decide si buscar recetas o analizar receta según el contexto
  const handleSearch = () => {
    if (recipeSelected) {
      analizeRecipe();
    } else {
      searchRecipes(1, false);
    }
  };

  // Carga más resultados en la paginación
  const handleLoadMore = () => {
    if (pagination && pagination.hasNext) {
      console.log(pagination);
      console.log("Has next", pagination.hasNext);
      searchRecipes(pagination.page + 1, true);
    }
  };

  // Selecciona una receta para hacer preguntas específicas sobre ella
  const handleRecipeFocus = (recipe: Recipe) => {
    setRecipeSelected(recipe);
  };

  // Cambia el tipo de búsqueda y resetea la conversación
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

  // Limpia los resultados de búsqueda y receta seleccionada
  const handleClearSearch = () => {
    setRecipes([]);
    setPagination(null);
    setRecipeSelected(null);
  };

  // FUNCIONES DE PROCESAMIENTO DE TEXTO
  // Convierte texto con **texto** a elementos JSX con negrita
  const parseBoldText = (text: string): React.ReactNode[] => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);

    return parts.map((part, i) => {
      const safePart = part ?? ""; // asegura que no sea undefined

      if (safePart.startsWith("**") && safePart.endsWith("**")) {
        return <strong key={i}>{safePart.slice(2, -2)}</strong>;
      }

      return <span key={i}>{safePart}</span>;
    });
  };

  // EFFECTS
  // Carga ingredientes al montar el componente
  useEffect(() => {
    fetchIngredients();
  }, []);

  useEffect(() => {
    if (!started) return;
    const fetchUserRecipes = async () => {
      if (!user) return;
      const userRecipes = await getUserRecipes(user?.id);
      if (userRecipes && userRecipes.success) {
        setUserRecipes(userRecipes.data as Recipe[]);
        console.log(userRecipes);
      }
    };
    fetchUserRecipes();
  }, [started, user]);

  // Filtra ingredientes cuando está en modo "ingredient" y hay texto de búsqueda
  useEffect(() => {
    if (type === "ingredient") {
      // Función para remover acentos para búsqueda más flexible
      const removeAccents = (str: string) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      };
      // Filtra ingredientes que coincidan con la búsqueda (sin acentos)
      const filtered = ingredients.filter((ingredient) => {
        return removeAccents(ingredient.name)
          .toLowerCase()
          .includes(removeAccents(search).toLowerCase());
      });
      setFilteredIngredients(filtered);
    } else {
      // Limpia ingredientes cuando no está en modo ingrediente
      setIncludedIngredients([]);
      setFilteredIngredients([]);
    }
  }, [type, search, ingredients]);

  // Maneja clicks fuera del dropdown para cerrarlo
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

  // RENDER PRINCIPAL
  return (
      <div className="flex flex-row w-full gap-10">
        {/* SECCIÓN PRINCIPAL - CHAT Y BÚSQUEDA */}
        <section
          className={`mt-10 ${
            recipes?.length > 0 ? " flex-[0.6]" : "flex-[0.8]"
          } flex flex-col ${
            !started ? "justify-center h-[70vh]" : "justify-end h-[80vh]"
          }   items-center w-full`}
        >
          {/* PANTALLA INICIAL - Solo se muestra antes de comenzar */}
          {!started && (
            <div className="mb-1 w-full max-w-[800px] leading-11">
              <h1 className="text-[32px] text5 font-bold">
                Hola, {capitalize(user?.name || "Usuario")}
              </h1>
              <h1 className="text-[32px]  text5 font-bold">
                ¿En qué puedo ayudarte?
              </h1>
              <p className="pt-2 text5 text-[17px] Dosis-Light tracking-tight">
                Elija una de las sugerencias a continuación o escriba la suya
                para comenzar a chatear con DualIAT.
              </p>
            </div>
          )}

          {/* ÁREA DE CONVERSACIÓN - Se muestra después de comenzar */}
          {started && (
            <div className="w-full max-w-[1100px] pe-3 max-h-[60vh] scroll2 h-full overflow-y-auto mt-4 flex flex-col gap-4">
              {/* Mapea todos los mensajes de la conversación */}
              {conversation.map((msg, index) => {
                const isExpanded = expandedIndex === index;
                return (
                  <div
                    key={index}
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                    className={`flex cursor-pointer ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* Burbuja de mensaje con estilos diferentes para usuario y IA */}
                    <div
                      className={`p-2 rounded-lg max-w-[70%] shadow text5 text-[15px] ${
                        msg.role === "user"
                          ? "bg-[#f5f5f5] border-2 border-[#e5a657] text-right"
                          : "bg-[#f0f0f0] border-2 border-[#b53325] text-left"
                      }
                    ${isExpanded ? "line-clamp-none" : "line-clamp-3"}
                    `}
                    >
                      {/* Procesa texto con negrita */}
                      {parseBoldText(msg.text)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* INDICADOR DE CARGA - Cuando está esperando respuesta */}
          {started && (
            <div className="w-full max-w-[1100px] mt-4 flex items-center justify-start gap-2">
              {isLoading && (
                <>
                  <Loader color="red" />
                  <span className="text-[15px] text5">
                    Esperando respuesta...
                  </span>
                </>
              )}
            </div>
          )}

          {/* MENSAJES DE ERROR */}
          {started && !isLoading && (
            <div className="w-full max-w-[1100px] mt-4 flex items-center justify-start gap-2">
              {error && <span className="text-[15px] text5">{error}</span>}
            </div>
          )}

          {/* INGREDIENTES SELECCIONADOS - Pills con ingredientes elegidos */}
          {includedIngredients.length > 0 && (
            <div
              className={`flex flex-wrap gap-2 mt-6 w-full max-w-[900px] max-h-[68px] overflow-y-auto items-center justify-center`}
            >
              {/* Muestra todos los ingredientes si está expandido, solo 3 si no */}
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

              {/* Botón para mostrar/ocultar más ingredientes */}
              {includedIngredients.length > 3 && (
                <div
                  typeof="button"
                  title="Ver más"
                  aria-label="Ver más"
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center justify-center cursor-pointer bg-yellow text1 rounded-full px-3 py-1 text-[14px] shrink-0"
                >
                  {expanded
                    ? "Ver menos"
                    : `+${includedIngredients.length - 3}`}
                </div>
              )}
            </div>
          )}

          {/* ÁREA DE INPUT PRINCIPAL - Búsqueda adaptativa */}
          <div
            onClick={focusInput}
            className={`w-full mt-7 relative flex gap-2 px-4 py-2 border border-gray-300 rounded-[10px] hover:shadow-md cursor-text
          ${
            !started
              ? "max-w-[800px] flex-col"
              : "max-w-[1100px] flex-row justify-between items-center"
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
                  : "Realiza una consulta o haz un pedido"
              }...`}
              className={`outline-none flex-[3] ps-3 placeholder:text-[#707070] ${
                !started && "pt-2"
              } placeholder:text-[16px] w-full text5`}
              value={search}
            />

            {/* CONTROLES DE BÚSQUEDA - Botones de tipo y búsqueda */}
            <div
              className={`flex ${
                !started && "justify-end flex-[1] w-full"
              } gap-4`}
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
                    className={`absolute top-full right-0 mt-2 z-50 flex items-center ${
                      !started && "flex-col"
                    } gap-1 p-2 rounded-lg shadow-lg`}
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

        {/* SECCIÓN DE RESULTADOS - RECETAS ENCONTRADAS */}
        {recipes?.length > 0 ? (
          <section className="flex-[0.3] mt-10 overflow-y-auto scroll2 max-h-[60vh] h-full">
            {/* Información de paginación y botón limpiar */}
            {pagination && (
              <div className="flex justify-between">
                <div className="mb-4 text-sm text-gray-600">
                  Mostrando {recipes.length} de {pagination.total} recetas
                  {pagination.totalPages > 1 &&
                    ` (Página ${pagination.page} de ${pagination.totalPages})`}
                </div>
                <div className="mb-4 text-sm">
                  <button
                    type="button"
                    onClick={() => handleClearSearch()}
                    className="text-[#4A4947] hover:text-[#b53325] transition-colors duration-200 cursor-pointer"
                  >
                    Borrar búsqueda
                  </button>
                </div>
              </div>
            )}

            <div>Tus recetas</div>

            {/* Lista de recetas encontradas */}
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                RecipeFocus={handleRecipeFocus}
                isSelected={recipeSelected?.id === recipe.id}
              />
            ))}

            {/* Botón "Cargar más" para paginación */}
            {pagination && pagination.hasNext && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-4 py-1 tracking-tight border-2 border-[#b53325] text-red rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loadingMore ? (
                    <div className="flex items-center gap-2">
                      <Loader color="red" size="6" />
                      Cargando más...
                    </div>
                  ) : (
                    `Cargar más recetas ${
                      pagination.total - recipes.length
                    } restantes`
                  )}
                </button>
              </div>
            )}
          </section>
        ) : (
          recipes?.length === 0 ||
          (started && (
            <section className="flex-[0.3] mt-15 overflow-y-auto scroll2 max-h-[60vh] flex-col h-full gap-2 flex items-center justify-center">
              <div className="p-2 rounded-full bg-gray-100 border-2 border-[#e6e6e6]">
                <Search size={22} color="#2F2F2F" />
              </div>
              <div className="text-center">
                <p className="text3 tracking-tight text-[16px]">
                  No se encontraron recetas
                </p>
                <p className="text-gray-500 tracking-tight text-[16px]">
                  Intenta con otros términos de búsqueda
                </p>
                <div>Tus recetas</div>
              </div>
            </section>
          ))
        )}

        <div>Tus recetas</div>
      </div>
  );
};

export default URecipes;
