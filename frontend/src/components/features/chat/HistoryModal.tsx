import Loader from "@/components/ui/feedback/Loader";
import {
  useDeleteChat,
  useHistory,
  useRenameChat,
  type ChatHistory,
} from "@/hooks/api/chat/useHistory";
import { getShortTimeAgo } from "@/utils/date";
import { EllipsisVertical, PencilIcon, TrashIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";

interface Props {
  onClose(): void;
  onNavigate: (chat_id: string) => void;
  handleNew: () => void;
}

type PartialChatHistory = Pick<ChatHistory, "chat_id" | "title">;

export default function HistoryModal({
  onClose,
  onNavigate,
  handleNew,
}: Props) {
  const [search, setSearch] = useState("");
  const [submitSearch, setSubmitSearch] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const { data: history, isFetching } = useHistory(submitSearch);

  const { mutate: deleteChat, isPending: isDeleting } = useDeleteChat();
  const { mutate: renameChat, isPending: isRenaming } = useRenameChat();

  const [selected, setSelected] = useState<PartialChatHistory | null>(null);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState(selected?.title || "");

  const handleDelete = () => {
    if (isDeleting || !selected) return;

    deleteChat(selected.chat_id, {
      onSuccess: () => {
        toast.success("Chat eliminado exitosamente");
        setSelected(null);
        handleNew();
        onClose();
      },
      onError: () => {
        toast.error("Error al eliminar el chat");
      },
    });
  };

  const handleStartRename = () => {
    if (!selected) return;

    const current = selected.title;

    setIsEditing(true);
    setNewTitle(current);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 50);
  };

  const handleSaveRename = useCallback(() => {
    if (!newTitle.trim() || !isEditing) {
      setIsEditing(false);
      return;
    }

    if (isRenaming) return;

    renameChat(
      { id: selected?.chat_id as string, title: newTitle },
      {
        onSuccess: () => {
          toast.success("Chat renombrado exitosamente");
          setSelected(null);
          setNewTitle("");
          setIsEditing(false);
        },

        onError: () => {
          toast.error("Error al renombrar el chat");
        },
      },
    );
  }, [newTitle, selected, renameChat, isRenaming, isEditing]);

  console.log("selected", selected);

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
          maxLength={200}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setSubmitSearch(search);
            }
          }}
          value={search}
          placeholder="Historial de conversaciones"
          onChange={(e) => {
            setSearch(e.target.value);

            if (e.target.value.trim() === "") {
              setSubmitSearch("");
            }
          }}
          type="text"
        />
      </div>

      <div className="flex flex-1">
        {isFetching ? (
          <div className="flex flex-1 justify-center items-center">
            <Loader size={24} color="#e5a657" />
          </div>
        ) : history?.length === 0 && !isFetching ? (
          <div className="flex flex-1 items-center justify-center flex-col gap-y-2">
            <h1 className="text-xl font-bold text-text-3">
              No se encontraron conversaciones
            </h1>
            <p className="text-base text-text-6">Intenta buscar otra cosa.</p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-y-4 overflow-y-auto">
            {history?.map((item: ChatHistory) => {
              return (
                <div
                  typeof="button"
                  key={item.chat_id}
                  onClick={() => onNavigate(item.chat_id)}
                  className={`px-3 py-1.5 justify-between flex flex-row rounded-[10px] ${isEditing ? "cursor-default" : "cursor-pointer hover:bg-gray-50"}`}
                >
                  <div className="flex flex-col gap-y-1 flex-1">
                    {isEditing && selected?.chat_id === item.chat_id ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRename();
                        }}
                        className="text-base text-text-3 border-b border-gray-300 focus:outline-none w-full bg-transparent"
                        style={{ padding: 0, margin: 0 }}
                      />
                    ) : (
                      <p className="text-base text-text-3 tracking-tight truncate pr-2">
                        {item.title}
                      </p>
                    )}

                    <span className="text-sm text-gray-500">
                      {getShortTimeAgo(new Date(item.lastActivity))}
                    </span>
                  </div>

                  {!isEditing && (
                    <div className="flex items-center">
                      <button
                        title="Más opciones"
                        type="button"
                        className="flex group hover:bg-[#3578e4]/20 p-2 rounded-full transition-colors items-center justify-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();

                          setSelected({
                            chat_id: item.chat_id,
                            title: item.title,
                          });
                        }}
                      >
                        <EllipsisVertical
                          size={20}
                          className="text-text-5 group-hover:text-[#3578e4] transition-all "
                        />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      {selected !== null && (
        <div className="flex flex-col gap-y-4 items-center">
          <p className="text-sm text-text-3">
            ¿Qué desea hacer con el chat "{selected?.title}"?
          </p>
          <div className="w-full flex gap-x-2 flex-row items-center justify-between">
            {["Eliminar", "Editar título"].map((option, idx) => {
              return (
                <button
                  onClick={() => {
                    if (idx === 0) {
                      handleDelete();
                    } else {
                      handleStartRename();
                    }
                  }}
                  disabled={idx === 0 ? isDeleting : isRenaming}
                  className={`flex-1 py-1.5 flex flex-row justify-center items-center gap-x-2 group cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 rounded-[10px] border border-dashed hover:border transition-all duration-200
                  ${idx === 0 ? "border-bg-red hover:bg-[#B53325]" : "border-bg-blue hover:bg-[#3578e4]"}`}
                >
                  {idx === 0 ? (
                    <TrashIcon
                      size={16}
                      className={`text-bg-red group-hover:text-white`}
                    />
                  ) : (
                    <PencilIcon
                      size={16}
                      className={`text-bg-blue group-hover:text-white`}
                    />
                  )}
                  <span
                    className={`text-sm group-hover:text-white ${idx === 0 ? "text-bg-red" : "text-bg-blue"}`}
                  >
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
