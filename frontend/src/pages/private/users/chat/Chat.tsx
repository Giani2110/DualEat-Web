import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@hooks/useAuth";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { BookSearch, ClockFading, SquarePen, X } from "lucide-react";

import type { Ingredient, Recipe, ChatSessionData } from "@interface/global";

import { useNavigate, useParams } from "react-router-dom";
import MessageInput from "@/components/features/chat/MessageInput";
import { useChat, useCreateMessage } from "@/hooks/api/chat/useChat";
import { useIngredients } from "@/hooks/api/recipe/useIngredients";
import IngredientsModal from "@/components/shared/IngredientsModal";
import HistoryModal from "@/components/features/chat/HistoryModal";
import RecipesModal from "@/components/features/chat/RecipesModal";
import { GridPattern } from "@/components/ui/feedback/grid-pattern";
import { ROUTES } from "@/api/constants/constants";

export default function ChatScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { chat_id } = useParams<{ chat_id: string }>();

  const { data: chat } = useChat(chat_id as string);
  const { mutate: createMessage, isPending } = useCreateMessage();

  const [query, setQuery] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const [message, setMessage] = useState("");

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"Historial" | "Recetas" | "Ingredientes">(
    "Historial",
  );

  const [ingredientsSelected, setIngredientsSelected] = useState<Ingredient[]>(
    [],
  );

  const { data: ingredients = [], isLoading: isLoadingIngredients } =
    useIngredients(true);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    if (!message) return;
    const text = message.trim();

    if (!user) return;

    if (
      user.subscription_status !== "ACTIVE" &&
      user.subscription_status !== "TRIAL"
    ) {
      navigate(ROUTES.USER.SUBSCRIPTION);
      return;
    }

    setMessage("");

    createMessage(
      {
        chat_id: chat_id || null,
        message: text,
        ingredients: ingredientsSelected,
      },
      {
        onSuccess: ({ data }) => {
          if (data?.recipes && data.recipes.length > 0) {
            setRecipes(data.recipes as Recipe[]);
            setQuery(data.search_query);
          }

          if (!chat_id && data?.chat?.chat_id) {
            navigate(`/chat/${data.chat.chat_id}`, { replace: true });
          }
        },
        onError: (error) => {
          console.log("Error al enviar mensaje:", error);
          setMessage(text);
        },
      },
    );
  };

  const handleNewChat = useCallback(() => {
    setMessage("");
    setIngredientsSelected([]);

    navigate(`/chat`, { replace: true });

    setQuery(null);
    setRecipes([]);
  }, [setQuery, setRecipes, navigate]);

  const handleSelectIngredient = (selectedIngredient: Ingredient) => {
    setIngredientsSelected((prev) => {
      if (prev.includes(selectedIngredient)) {
        return prev.filter((ing) => ing.id !== selectedIngredient.id);
      }

      return [...prev, selectedIngredient];
    });
  };

  const onNavigate = (chat_id: string) => {
    navigate(`/chat/${chat_id}`, { replace: true });
    handleClose();
  };

  const renderSection = () => {
    switch (type) {
      case "Historial":
        return (
          <HistoryModal
            onClose={() => handleClose()}
            handleNew={handleNewChat}
            onNavigate={onNavigate}
          />
        );
      case "Recetas":
        return chat ? (
          <RecipesModal
            chat={chat}
            recipes={recipes}
            setRecipes={setRecipes}
            query={query}
            setQuery={setQuery}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <span className="text-text-5 text-sm">
              Tienes que iniciar un chat para ver recetas
            </span>
          </div>
        );

      case "Ingredientes":
        return (
          <IngredientsModal
            ingredients={ingredients}
            isLoading={isLoadingIngredients}
            ingredientsIds={ingredientsSelected}
            onSelectIngredient={handleSelectIngredient}
            setIngredientsIds={setIngredientsSelected}
          />
        );
      default:
        return null;
    }
  };

  const messages = useMemo(
    () => (chat?.messages || []) as ChatSessionData[],
    [chat],
  );

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <main className="relative p-4 flex-1 gap-y-3 flex flex-col items-center h-full w-full bg-bg-semi-white">
      <GridPattern
        width={10}
        height={10}
        strokeDasharray="4 2"
        className="absolute inset-0 opacity-[0.05] h-full stroke-gray-400 z-0 pointer-events-none"
      />

      <header
        className={`w-full py-2 sticky top-15 flex flex-row items-center justify-between z-10 ${!chat?.chat_id ? "justify-end" : ""}`}
      >
        {chat?.chat_id && (
          <button
            type="button"
            onClick={() => {
              setType("Recetas");
              setOpen(true);
            }}
            className={`flex flex-row items-center gap-x-1 rounded-[10px] px-3 py-1.5 font-semibold text-[14px] cursor-pointer hover:bg-gray-100 transition-all duration-200`}
          >
            <BookSearch size={18} color="#4A4947" />
            Recetas
          </button>
        )}

        <div className="flex flex-row items-center gap-x-4">
          <button
            type="button"
            onClick={() => {
              setType("Historial");
              setOpen(true);
            }}
            className={`flex flex-row items-center gap-x-1 rounded-[10px] px-3 py-1.5 font-semibold text-[14px] cursor-pointer hover:bg-gray-100 transition-all duration-200`}
          >
            <ClockFading size={18} color="#4A4947" />
            Historial
          </button>
          <button
            type="button"
            onClick={() => {
              handleNewChat();
            }}
            className={`rounded-[10px] px-3 py-1.5 cursor-pointer hover:bg-gray-100 transition-all duration-200`}
          >
            <SquarePen size={18} color="#4A4947" />
          </button>
        </div>
      </header>

      {!chat ? (
        <section className="flex-1 w-full h-full flex flex-col justify-center items-center gap-y-6">
          <div className="w-full flex flex-col items-center gap-y-1">
            <h1 className="text-text-5 font-outfit-light text-lg md:text-xl">
              Hola, {user ? user.name : "Usuario"}
            </h1>
            <h2 className="text-text-3 font-bold text-2xl md:text-3xl">
              ¿Por dónde empezamos?
            </h2>
          </div>

          <div className="w-full max-w-[800px]">
            <MessageInput
              message={message}
              isPending={isPending}
              setMessage={setMessage}
              setOpenIngredients={() => {
                setType("Ingredientes");
                setOpen(true);
              }}
              handleSubmit={handleSubmit}
            />
          </div>
        </section>
      ) : (
        <section
          style={{ paddingBottom: "8vh" }}
          className="w-full h-full justify-center items-center flex overflow-hidden"
        >
          <div className="flex-1 w-full overflow-y-auto flex flex-col items-center">
            <div className="max-w-[1000px] w-full flex flex-col px-4">
              {messages.map((item, index) => (
                <div
                  key={index}
                  className={`mb-6 ${item.role === "USER" ? "self-end" : "self-start"}`}
                  style={getBubbleStyles(item.role === "USER")}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {item.text}
                  </ReactMarkdown>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="w-full p-4 max-w-[90vw] lg:max-w-[1200px] fixed bottom-0">
            <MessageInput
              message={message}
              isPending={isPending}
              setMessage={setMessage}
              handleSubmit={handleSubmit}
              setOpenIngredients={() => {
                setType("Ingredientes");
                setOpen(true);
              }}
            />
          </div>
        </section>
      )}

      {open && (
        <div style={{ zIndex: 999 }} className="fixed inset-0 flex flex-1">
          <div
            className="bg-black/40 flex-1"
            onClick={() => {
              handleClose();
            }}
          />

          <aside
            style={{ zIndex: 1000 }}
            className="bg-bg-semi-white border-l w-full max-w-[90vw] md:max-w-[50vw] lg:max-w-[30vw] border-gray-400 shadow-xl shadow-gray-200 overflow-y-auto p-4 flex flex-col gap-y-3"
          >
            <header className="flex flex-row gap-x-4 justify-start items-center">
              <button
                type="button"
                className="cursor-pointer transition-all rounded-full p-1.5 hover:bg-gray-200 duration-200"
                onClick={() => {
                  handleClose();
                }}
              >
                <X size={20} color="#2F2F2F" />
              </button>
              <h2 className="font-bold text-[18px] text-text-3">{type}</h2>
            </header>

            <div className="flex flex-row w-full border-b border-gray-200 mt-2">
              {["Historial", "Recetas", "Ingredientes"].map((t) => (
                <button
                  key={t}
                  className={`flex-1 relative flex flex-col items-center gap-y-1.5 pt-2 cursor-pointer hover:bg-gray-200 text-[14px] transition-colors duration-200 ${
                    type === t
                      ? "font-bold text-text-3"
                      : "font-outfit-light text-text-3"
                  }`}
                  onClick={() => {
                    setType(t as "Historial" | "Recetas");
                  }}
                >
                  <div className="flex flex-row gap-x-2 items-center">
                    {t}
                    {t === "Ingredientes" && (
                      <span className="text-[10px] font-bold text-text-1 bg-bg-blue px-1 rounded-full">
                        {ingredientsSelected && ingredientsSelected.length}
                      </span>
                    )}
                  </div>

                  {type === t && (
                    <span className="h-1 bg-bg-blue w-[80%] rounded-full" />
                  )}
                </button>
              ))}
            </div>
            {renderSection()}
          </aside>
        </div>
      )}
    </main>
  );
}

const getBubbleStyles = (isUser: boolean): React.CSSProperties => ({
  fontFamily: "Outfit-Light, sans-serif",
  fontSize: "15px",
  color: "#4A4947",
  maxWidth: isUser ? "70%" : "95%",
  padding: isUser ? "4px 16px" : "0px",
  borderRadius: isUser ? "15px" : "0px",
  borderWidth: isUser ? "1px" : "0px",
  borderStyle: "solid",
  borderColor: isUser ? "#dbdbdb" : "transparent",
  width: "fit-content",
});

const markdownComponents = {
  p: ({ node, ...props }: any) => (
    <p
      style={{
        marginTop: 0,
        marginBottom: 0,
        lineHeight: "28px",
      }}
      {...props}
    />
  ),
  strong: ({ node, ...props }: any) => (
    <strong
      style={{
        fontFamily: "Outfit-Bold, sans-serif",
        fontWeight: "bold",
      }}
      {...props}
    />
  ),
  ul: ({ node, ...props }: any) => (
    <ul
      style={{
        listStyleType: "disc",
        paddingLeft: "24px",
        marginBottom: "12px",
      }}
      {...props}
    />
  ),

  ol: ({ node, ...props }: any) => (
    <ol
      style={{
        listStyleType: "decimal",
        paddingLeft: "24px",
        marginBottom: "12px",
      }}
      {...props}
    />
  ),

  li: ({ node, ...props }: any) => (
    <li
      style={{
        marginBottom: "6px",
        lineHeight: "28px",
      }}
      {...props}
    />
  ),
};
