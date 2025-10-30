import { useState, useRef, useEffect } from "react";
import { getAllIngredients } from "@services/recipes.api";
import { useAuth } from "@hooks/useAuth";
import { capitalize } from "@utils/capitalize";

import { askOllama, askRecipe, getChat } from "@/services/chat.api";

import toast from "react-hot-toast";
import RecipeCard from "@components/users/cards/RecipeCard";
import LogoIA from "@assets/images/icon/DualIA.avif";

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
  CHATData,
  ChatSessionData,
} from "@interface/global";

import Loader from "@components/animation/Loader";
import { useChat } from "@/hooks/useChat";

const URecipes = () => {
  const { user } = useAuth();
  const { chat_id, conversation, setConversation, setStarted, started } =
    useChat();

  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [search, setSearch] = useState("");

  // ESTADOS DE INGREDIENTES
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>(
    []
  );
  // IDs de ingredientes seleccionados para búsqueda
  const [includedIngredients, setIncludedIngredients] = useState<number[]>([]);

  // ESTADOS DE RECETAS Y TIPO DE BÚSQUEDA
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [type, setType] = useState<"ask" | "recipe" | "ingredient">("ask");

  // ESTADOS DE UI Y INTERACCIÓN
  const [open, setOpen] = useState(false);

  const [expanded, setExpanded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);

  // ESTADOS DE CONVERSACIÓN Y CHAT
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [recipeSelected, setRecipeSelected] = useState<Recipe | null>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  // Busca recetas usando el servicio de IA con paginación
  const searchRecipes = async (
    page: number = 1,
    isLoadMore: boolean = false
  ) => {
    if (!search.trim()) return;

    setIsLoading(true);

    // Declaramos conversationBeforeRequest y la inicializamos con el estado actual.
    let conversationBeforeRequest = conversation || [];
    let aiResponses: ChatSessionData[] = [];

    // --- LÓGICA PRE-PETICIÓN (Solo si type es "ask") ---
    if (type === "ask") {
      setStarted(true);
      const userMessage: ChatSessionData = { text: search, role: "USER" };

      // Calculamos el nuevo array para la petición y la actualización de Redux.
      conversationBeforeRequest = conversationBeforeRequest.concat(userMessage);

      // Actualizamos Redux con el mensaje del usuario.
      setConversation(conversationBeforeRequest);
    }

    try {
      if (type === "ingredient") {
        setSearch("");
      }

      const response = await askOllama(
        search,
        type,
        includedIngredients,
        page,
        conversationBeforeRequest,
        chat_id
      );

      // Limpiamos los resultados antes de procesar la respuesta
      setPagination(null);
      setRecipes([]);

      if (!response?.success) {
        toast.error(
          "Perdón, no pudimos obtener respuesta. Intenta nuevamente."
        );
        return;
      }

      // --- LÓGICA POST-PETICIÓN (Si response.success es true) ---

      // 1. Manejo de la Respuesta del Chat (si existe un 'comment')
      if (response.comment) {
        aiResponses = Array.isArray(response.comment)
          ? response.comment.map((c: ChatSessionData) => ({
              text: c.text,
              role: "IA",
            }))
          : [{ text: response.comment, role: "IA" }];
      }

      // 2. Actualización de CONVERSACIÓN (Solo si type es "ask")
      if (type === "ask") {
        if (aiResponses.length > 0) {
          // Unimos el historial de antes de la petición con la nueva respuesta de la IA.
          const finalConversation =
            conversationBeforeRequest.concat(aiResponses);
          setConversation(finalConversation);
        }
        // Opcional: Mostrar un mensaje si 'ask' no devolvió comment (respuesta vacía)
        if (!response.comment) {
          toast.error("No se recibió una respuesta del modelo.");
        }
      }

      // 3. Actualización de RECETAS y Paginación (Si hay datos de recetas)
      if (type !== "ask" && response.data) {
        setRecipes((prev) =>
          isLoadMore
            ? [...prev, ...(response.data as Recipe[])]
            : (response.data as Recipe[])
        );

        if (recipes.length === 0) {
          toast.error("No se encontraron recetas. Intenta otra.");
        }

        // La paginación siempre va con recetas
        if (response.pagination) {
          setPagination(response.pagination as PaginationInfo);
        }
      }

      // 4. Muestra la receta si el type no es ask y no hay data (pudo ser un error de la IA)
      if (type !== "ask" && !response.data) {
        toast.error(
          response.comment || "Búsqueda sin resultados. Intenta otra."
        );
      }
    } catch (err) {
      toast.error(
        "Perdón, ocurrió un error en la conexión. Intenta nuevamente."
      );
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const analizeRecipe = async () => {
    if (!search.trim() || !recipeSelected) return;

    setIsLoading(true);

    const userMessage: ChatSessionData = { text: search, role: "USER" };

    const conversationBeforeRequest = (conversation || []).concat(userMessage);

    setConversation(conversationBeforeRequest);

    try {
      const response = await askRecipe(
        search,
        recipeSelected.id,
        conversationBeforeRequest
      );
      if (response?.success && response.comment) {
        // Procesa respuesta de IA similar a searchRecipes
        const aiResponses: ChatSessionData[] = Array.isArray(response.comment)
          ? response.comment.map((c: ChatSessionData) => ({
              text: c.text,
              role: "IA",
            }))
          : [{ text: response.comment, role: "IA" }];

        const finalConversation = conversationBeforeRequest.concat(aiResponses);

        setConversation(finalConversation);
      }
    } catch (err) {
      toast.error(
        "Perdón, no pudimos responder tu pregunta. Intenta nuevamente."
      );
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  // HANDLERS DE EVENTOS
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

  const handleRecipeFocus = (recipe: Recipe) => {
    if (recipeSelected?.id === recipe.id) {
      setRecipeSelected(null);
    } else {
      setRecipeSelected(recipe);
    }
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

  const handleClearSearch = () => {
    setRecipes([]);
    setPagination(null);
    setRecipeSelected(null);
  };

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

  useEffect(() => {
    if (chat_id !== null) {
      setStarted(true);
      setConversation([]);

      const fetchChat = async () => {
        const response = await getChat(chat_id);
        if (response) {
          const chatData = response.data as CHATData;
          setConversation(chatData.messages);
          console.log(response.data);
        }
      };
      fetchChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat_id]);

  // Carga ingredientes al montar el componente
  useEffect(() => {
    const fetchIngredients = async () => {
      const ingredients = await getAllIngredients();
      if (ingredients && ingredients.success) {
        setIngredients(ingredients.data as Ingredient[]);
      }
    };

    fetchIngredients();
  }, []);

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

  useEffect(() => {
    const container = endRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [conversation]);

  return (
    <div
      className={`flex h-full min-h-[85vh] flex-col lg:flex-row w-[90%] gap-8 lg:gap-6 mx-auto
        `}
    >
      {/* SECCIÓN PRINCIPAL - CHAT Y BÚSQUEDA */}
      <section
        className={`flex flex-col w-full h-full lg:h-[90vh] flex-2  ${
          !started
            ? "items-center justify-center flex-1"
            : recipes.length > 0
            ? "justify-start"
            : "justify-end"
        } 
    `}
      >
        {/* PANTALLA INICIAL - Solo se muestra antes de comenzar */}
        {!started && (
          <div className="mb-1 w-full max-w-[900px] leading-11">
            <h1 className="text-[32px] text5 font-bold">
              Hola, {capitalize(user?.name || "Usuario")}
            </h1>
            <h1 className="text-[32px]  text5 font-bold">
              ¿En qué puedo ayudarte?
            </h1>
            <p className="pt-2 text5 text-[18px] Dosis-Light tracking-tight">
              Elija una de las sugerencias a continuación o escriba la suya para
              comenzar a chatear con DualIA.
            </p>

            {isLoading && (
              <div className="w-full mt-4 flex items-center gap-2">
                <Loader color="gray-500" />
                <span className="text-[15px] text5">
                  Esperando respuesta...
                </span>
              </div>
            )}
          </div>
        )}

        {/* ÁREA DE CONVERSACIÓN - Se muestra después de comenzar */}
        {started && (
          <div
            ref={endRef}
            className="w-full pe-3 max-h-[80vh] pb-3 scroll2 h-full overflow-y-auto mt-8 flex flex-col gap-4"
          >
            {(Array.isArray(conversation) ? conversation : []).map(
              (msg, index) => {
                const isExpanded = expandedIndex === index;
                return (
                  <div
                    className={`flex ${
                      msg.role === "USER" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex flex-start max-w-[60%] gap-2 ${
                        msg.role === "USER" ? "" : "flex-row-reverse"
                      }`}
                    >
                      <div
                        key={index}
                        onClick={() =>
                          setExpandedIndex(isExpanded ? null : index)
                        }
                        className={`p-2 rounded-lg shadow text5 cursor-pointer text-[15px] border-1 bg-[#ffffffcc] ${
                          msg.role === "USER"
                            ? "border-[#4A4947] text-right"
                            : "border-[#dbdbdb] text-left"
                        }
                      ${isExpanded ? "line-clamp-none" : "line-clamp-3"}
                      `}
                      >
                        {parseBoldText(msg.text)}
                      </div>
                      <img
                        src={
                          msg.role === "USER"
                            ? user?.avatar_url ||
                              "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png"
                            : LogoIA
                        }
                        alt="Imagen del usuario"
                        className="max-w-7 max-h-7 rounded-full"
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

        {/* INDICADOR DE CARGA - Cuando está esperando respuesta */}
        {started && isLoading && (
          <div className="w-full mt-4 flex items-center gap-2">
            <Loader color="gray-500" />
            <span className="text-[15px] text5">Esperando respuesta...</span>
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
                {expanded ? "Ver menos" : `+${includedIngredients.length - 3}`}
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
        <section className="flex-[1] flex flex-col justify-start mt-8 overflow-y-auto scroll2 mx-auto w-full max-h-fit max-w-[1100px] md:max-h-[60vh] h-full">
          {/* Información de paginación y botón limpiar */}
          {pagination && (
            <div className="flex justify-between text-sm mb-4">
              <div className="text5">
                Mostrando {recipes.length} de {pagination.total} recetas
                {pagination.totalPages > 1 &&
                  ` (Página ${pagination.page} de ${pagination.totalPages})`}
              </div>
              <div>
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
                //disabled={loadingMore}
                className="px-4 py-1 tracking-tight border-2 border-[#b53325] text-red rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {/*{loadingMore ? (
                  <div className="flex items-center gap-2">
                    <Loader color="red" size="6" />
                    Cargando más...
                  </div>
                ) : (
                  `Cargar más recetas ${
                    pagination.total - recipes.length
                  } restantes`
                )}*/}
              </button>
            </div>
          )}
        </section>
      ) : (
        recipes?.length === 0 || (
          <section className="flex-[0.3] mt-15 overflow-y-auto scroll2 max-h-fit md:max-h-[30vh] flex-col h-full gap-2 flex items-center justify-center">
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
            </div>
          </section>
        )
      )}
    </div>
  );
};

export default URecipes;
