import React, { useState } from "react";

import { editChat, deleteChat } from "@/services/chat.api";
import toast from "react-hot-toast";
import { useChat } from "@/hooks/useChat";

interface ChatModalProps {
  onClose: () => void;
  chat_id: string;
  type: "title" | "delete" | "";
}

const ChatModal: React.FC<ChatModalProps> = ({ type, onClose, chat_id }) => {
  const [inputValue, setInputValue] = useState("");
  const { removeChat, updateChatTitle } = useChat();

  const handleButton = async () => {
    try {
      if (type === "title") {
        const response = await editChat(chat_id, inputValue);
        if (response?.success) {
          toast.success("Título actualizado");
          updateChatTitle(chat_id, inputValue);
        }
      } else if (type === "delete") {
        const response = await deleteChat(chat_id);
        if (response?.success) {
          toast.success("Conversación eliminada");
          removeChat(chat_id);
        }
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      toast.error("Error al actualizar el título");
      console.error("Error al actualizar el título:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-[#000]/30"
        onClick={() => onClose()}
      />
      <div className="relative bg-[#f5f5f5] p-6 rounded-[20px] box-border py-4 px-5 z-10 shadow-lg w-full max-w-[600px] h-fit flex flex-col">
        {type === "title" ? (
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4 text-[#e5a657]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-pencil-line-icon lucide-pencil-line"
              >
                <path d="M13 21h8" />
                <path d="m15 5 4 4" />
                <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
              </svg>
              <h2 className="text-[26px] Dosis-Bold text5">
                Cambiar el nombre de esta conversación
              </h2>
            </div>

            <input
              onChange={(e) => setInputValue(e.currentTarget.value)}
              className="border border-[#dbdbdb] rounded-[4px] w-full p-3 outline-[#e5a657] text4"
              placeholder="Escribe el nuevo nombre de la conversación"
              type="text"
            />

            <div className="flex gap-3 justify-end mt-8 Dosis-Bold">
              <button
                type="button"
                onClick={() => onClose()}
                className="cursor-pointer text4 hover:bg-[#4A4947] hover:text-[#fff]! py-2 px-4 rounded-full transition duration-150"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => handleButton()}
                className="cursor-pointer text-white bg-yellow hover:bg-yellow-500! py-2 px-4 rounded-full transition duration-150"
              >
                Cambiar nombre
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4 text-[#b53325]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-trash2-icon lucide-trash-2"
              >
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              <h2 className="text-[26px] Dosis-Bold text5">
                ¿Eliminar conversación?
              </h2>
            </div>

            <p className="mt-4 text4 text-[16px]">
              Toda la actividad registrada en esta conversación—incluyendo
              solicitudes, respuestas y comentarios—será eliminada
              <span className="Dosis-Bold"> permanentemente</span>.
            </p>

            <div className="flex gap-3 justify-end mt-8 Dosis-Bold">
              <button
                type="button"
                onClick={() => onClose()}
                className="cursor-pointer text4 hover:bg-[#4A4947] hover:text-[#fff]! py-2 px-4 rounded-full transition duration-150"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => handleButton()}
                className="cursor-pointer text-white bg-red hover:bg-red-700! py-2 px-4 rounded-full transition duration-150"
              >
                Eliminar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatModal;
