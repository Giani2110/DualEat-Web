import { useState, useEffect } from "react";
import { getAllIngredients } from "@services/recipes.api";

import { useAuth } from "@hooks/useAuth";
import { useChat } from "@hooks/chat/useChat";
import { useRecipeSearch } from "@/hooks/chat/useRecipeSearch";
import { capitalize } from "@utils/capitalize";
import { getChat } from "@/services/chat.api";

import { Trash2,} from "lucide-react";

import type {
  Ingredient,
  Recipe,
  CHATData,
  ChatSessionData,
} from "@interface/global";

import Loader from "@components/animation/Loader";


import WelcomeScreen from "@/components/private/users/chat/WelcomeScreen";
import ChatConversation from "@/components/private/users/chat/ChatConversation";
import SearchInputBar from "@/components/private/users/chat/SearchInputBar";
import RecipeCard from "@/components/private/users/chat/RecipeCard";

const URecipes = () => {
  const { user } = useAuth();
  const { chat_id, conversation, setConversation, setStarted, started } =
    useChat();

  const {
    recipes,
    pagination,
    isLoading,
    searchRecipes,
    askRecipeSearch,
    setPagination,
    setRecipes,
  } = useRecipeSearch();

  //const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [search, setSearch] = useState("");

  // ESTADOS DE INGREDIENTES
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>(
    []
  );
  // IDs de ingredientes seleccionados para búsqueda
  const [includedIngredients, setIncludedIngredients] = useState<number[]>([]);

  // ESTADOS DE RECETAS Y TIPO DE BÚSQUEDA
  const [type, setType] = useState<"ask" | "recipe" | "ingredient">("ask");
  const [recipeID, setRecipeID] = useState<string>("");

  // ESTADOS DE UI Y INTERACCIÓN
  const [expanded, setExpanded] = useState(false);

  // ESTADOS DE CONVERSACIÓN Y CHAT
  const [recipeSelected, setRecipeSelected] = useState<Recipe | null>(null);

  // HANDLERS DE EVENTOS
  const handleSearch = async () => {
    if (!search.trim()) return;

    setStarted(true);

    let conversationBeforeRequest = conversation || [];

    if (type === "ask") {
      const userMessage: ChatSessionData = { text: search, role: "USER" };
      conversationBeforeRequest = [...(conversation || []), userMessage];

      setConversation(conversationBeforeRequest);
    }
    setSearch("");

    try {
      const response = recipeSelected
        ? await askRecipeSearch({
            search,
            recipeId: String(recipeSelected.id),
            conversationHistory: conversationBeforeRequest,
            chat_id,
          })
        : await searchRecipes({
            search,
            type,
            includedIngredients,
            page: 1,
            isLoadMore: false,
            conversationHistory: conversationBeforeRequest,
            chat_id,
          });

      if (response) {
        const botMessage: ChatSessionData = { text: response, role: "IA" };
        const conversationAfterRequest = [
          ...conversationBeforeRequest,
          botMessage,
        ];
        setConversation(conversationAfterRequest);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Carga más resultados en la paginación
  /*const handleLoadMore = () => {
    if (pagination && pagination.hasNext) {
      console.log(pagination);
      console.log("Has next", pagination.hasNext);
      searchRecipes(pagination.page + 1, true);
    }
  };*/

  const handleRecipeFocus = (recipe: Recipe) => {
    if (recipeSelected?.id === recipe.id) {
      setRecipeSelected(null);
    } else {
      setRecipeSelected(recipe);
    }
  };

  // Cambia el tipo de búsqueda y resetea la conversación

  const handleClearSearch = () => {
    setRecipes([]);
    setPagination(null);
    setRecipeSelected(null);
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

          if (chatData.activeRecipeId) {
            setRecipeID(chatData.activeRecipeId);
          }
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
        {!started && user && (
          <WelcomeScreen user={user} isLoading={isLoading} />
        )}

        {/* ÁREA DE CONVERSACIÓN - Se muestra después de comenzar */}
        {started && user && (
          <ChatConversation conversation={conversation} user={user} />
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
            className={`flex flex-wrap gap-2 mt-6 w-full min-h-[40px] overflow-y-auto items-center justify-center ${
              started ? "w-full" : "max-w-[900px]"
            }`}
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
              <button
                type="button"
                title="Ver más"
                aria-label="Ver más"
                onClick={() => setExpanded(!expanded)}
                className="flex items-center justify-center cursor-pointer bg-yellow text1 rounded-full px-3 py-1 text-[14px] shrink-0"
              >
                {expanded ? "Ver menos" : `+${includedIngredients.length - 3}`}
              </button>
            )}
          </div>
        )}

        {/* ÁREA DE INPUT PRINCIPAL - Búsqueda adaptativa */}
        <SearchInputBar
          type={type}
          setType={setType}
          recipeSelected={recipeSelected}
          started={started}
          search={search}
          setSearch={setSearch}
          handleSearch={handleSearch}
          filteredIngredients={filteredIngredients}
          includedIngredients={includedIngredients}
          setIncludedIngredients={setIncludedIngredients}
        />
      </section>

      {/* SECCIÓN DE RESULTADOS - RECETAS ENCONTRADAS */}
      {recipes?.length > 0 && (
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
        </section>
      )}
    </div>
  );
};

export default URecipes;