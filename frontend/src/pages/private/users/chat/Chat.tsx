import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@hooks/useAuth";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { X } from "lucide-react";

import type { Ingredient, Recipe, ChatSessionData } from "@interface/global";

import { useNavigate, useParams } from "react-router-dom";
import MessageInput from "@/components/features/chat/MessageInput";
import { useChat, useCreateMessage } from "@/hooks/api/chat/useChat";
import { useIngredients } from "@/hooks/api/recipe/useIngredients";
import IngredientsModal from "@/components/shared/IngredientsModal";
import HistoryModal from "@/components/features/chat/HistoryModal";

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

  const [search, setSearch] = useState("");

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

    setMessage("");

    createMessage(
      {
        chat_id: chat_id || null,
        recipe_id: chat?.recipe_id || null,
        message: text,
        prevMessages: (chat?.messages as ChatSessionData[]) || [],
        ingredients: ingredientsSelected,
      },
      {
        onSuccess: (data) => {
          if (data.recipes && data.recipes.length > 0) {
            setRecipes(data.recipes as Recipe[]);
            setQuery(data.search_query);
          }

          if (!chat_id && data.chat?.chat_id) {
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

  const sections = useMemo(() => {
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
        return <section className="flex flex-1 flex-col"></section>;
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
        break;
    }
  }, [type, ingredients, isLoadingIngredients, ingredientsSelected, search]);

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
    <section className="flex flex-row w-full h-full justify-center items-center bg-bg-semi-white">
      <main className="relative flex flex-col items-center h-full w-full">
        <header className="p-4 w-full flex flex-row items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setType("Recetas");
              setOpen(true);
            }}
            className={`flex flex-row items-center gap-x-1 rounded-[10px] px-3 py-1.5 font-semibold text-[14px] cursor-pointer hover:bg-gray-100 transition-all duration-200`}
          >
            <svg width={20} height={20} viewBox="0 0 640 640">
              <path
                fill="#4A4947"
                d="M480 576L192 576C139 576 96 533 96 480L96 160C96 107 139 64 192 64L496 64C522.5 64 544 85.5 544 112L544 400C544 420.9 530.6 438.7 512 445.3L512 512C529.7 512 544 526.3 544 544C544 561.7 529.7 576 512 576L480 576zM192 448C174.3 448 160 462.3 160 480C160 497.7 174.3 512 192 512L448 512L448 448L192 448zM224 216C224 229.3 234.7 240 248 240L424 240C437.3 240 448 229.3 448 216C448 202.7 437.3 192 424 192L248 192C234.7 192 224 202.7 224 216zM248 288C234.7 288 224 298.7 224 312C224 325.3 234.7 336 248 336L424 336C437.3 336 448 325.3 448 312C448 298.7 437.3 288 424 288L248 288z"
              />
            </svg>
            Recetas
          </button>

          <div className="flex flex-row items-center gap-x-4">
            <button
              type="button"
              onClick={() => {
                setType("Historial");
                setOpen(true);
              }}
              className={`flex flex-row items-center gap-x-1 rounded-[10px] px-3 py-1.5 font-semibold text-[14px] cursor-pointer hover:bg-gray-100 transition-all duration-200`}
            >
              <svg
                width={20}
                height={20}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
              >
                <path
                  fill={"#4A4947"}
                  d="M320 128C426 128 512 214 512 320C512 426 426 512 320 512C254.8 512 197.1 479.5 162.4 429.7C152.3 415.2 132.3 411.7 117.8 421.8C103.3 431.9 99.8 451.9 109.9 466.4C156.1 532.6 233 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C234.3 64 158.5 106.1 112 170.7L112 144C112 126.3 97.7 112 80 112C62.3 112 48 126.3 48 144L48 256C48 273.7 62.3 288 80 288L104.6 288C105.1 288 105.6 288 106.1 288L192.1 288C209.8 288 224.1 273.7 224.1 256C224.1 238.3 209.8 224 192.1 224L153.8 224C186.9 166.6 249 128 320 128zM344 216C344 202.7 333.3 192 320 192C306.7 192 296 202.7 296 216L296 320C296 326.4 298.5 332.5 303 337L375 409C384.4 418.4 399.6 418.4 408.9 409C418.2 399.6 418.3 384.4 408.9 375.1L343.9 310.1L343.9 216z"
                />
              </svg>
              Historial
            </button>
            <button
              type="button"
              onClick={() => {
                handleNewChat();
              }}
              className={`rounded-[10px] px-3 py-1.5 cursor-pointer hover:bg-gray-100 transition-all duration-200`}
            >
              <svg width={22} height={22} viewBox="0 0 640 640">
                <path
                  fill="#2F2F2F"
                  d="M505 122.9L517.1 135C526.5 144.4 526.5 159.6 517.1 168.9L488 198.1L441.9 152L471 122.9C480.4 113.5 495.6 113.5 504.9 122.9zM273.8 320.2L408 185.9L454.1 232L319.8 366.2C316.9 369.1 313.3 371.2 309.4 372.3L250.9 389L267.6 330.5C268.7 326.6 270.8 323 273.7 320.1zM437.1 89L239.8 286.2C231.1 294.9 224.8 305.6 221.5 317.3L192.9 417.3C190.5 425.7 192.8 434.7 199 440.9C205.2 447.1 214.2 449.4 222.6 447L322.6 418.4C334.4 415 345.1 408.7 353.7 400.1L551 202.9C579.1 174.8 579.1 129.2 551 101.1L538.9 89C510.8 60.9 465.2 60.9 437.1 89zM152 128C103.4 128 64 167.4 64 216L64 488C64 536.6 103.4 576 152 576L424 576C472.6 576 512 536.6 512 488L512 376C512 362.7 501.3 352 488 352C474.7 352 464 362.7 464 376L464 488C464 510.1 446.1 528 424 528L152 528C129.9 528 112 510.1 112 488L112 216C112 193.9 129.9 176 152 176L264 176C277.3 176 288 165.3 288 152C288 138.7 277.3 128 264 128L152 128z"
                />
              </svg>
            </button>
          </div>
        </header>

        {!chat ? (
          <div className="w-full h-full flex flex-col justify-center items-center gap-y-6 px-4">
            <div className="w-full flex flex-col items-center">
              <h1 className="text-text-5 font-outfit-light text-xl">
                Hola, {user ? user.name : "Usuario"}
              </h1>
              <h2 className="text-text-3 font-bold text-3xl">
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
          </div>
        ) : (
          <div className="w-full h-full flex flex-col overflow-hidden">
            <div className="flex-1 w-full overflow-y-auto flex flex-col items-center">
              <div className="max-w-[800px] w-full flex flex-col px-4">
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

            <div className="w-full mx-auto p-4 max-w-[1000px]">
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
          </div>
        )}
      </main>

      {open && (
        <div style={{ zIndex: 999 }} className="fixed inset-0 flex flex-1">
          <div
            style={{ flex: 2 }}
            className="bg-black/40"
            onClick={() => {
              handleClose();
            }}
          />

          <aside
            style={{ zIndex: 1000 }}
            className="bg-bg-semi-white border-l min-w-[80vw] md:min-w-[45vw] lg:min-w-[25vw] border-gray-400 shadow-xl shadow-gray-200 overflow-y-auto p-4 flex flex-col gap-y-3"
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
            {sections}
          </aside>
        </div>
      )}
    </section>
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
