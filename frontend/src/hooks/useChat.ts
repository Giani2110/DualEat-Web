import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../hub/index";
import {
  setChats,
  clearChats,
  addChat,
  removeChat,
  removeActiveChatId,
  setActiveChatId,
  setStarted,
  setConversation,
  updateChatTitle,
} from "../hub/slices/chatSlice";
import type { ChatMetadata, ChatSessionData } from "@/interface/global";

export const useChat = () => {
  const chats = useSelector((state: RootState) => state.chat.chats);
  const chat_id = useSelector((state: RootState) => state.chat.activeChatId);
  const started = useSelector((state: RootState) => state.chat.started);
  const conversation = useSelector(
    (state: RootState) => state.chat.conversation
  );
  const dispatch = useDispatch();

  return {
    chats,
    chat_id,
    started,
    conversation,
    setChats: (data: typeof chats) => dispatch(setChats(data)),
    clearChats: () => dispatch(clearChats()),
    addChat: (chat: ChatMetadata) => dispatch(addChat(chat)),
    removeChat: (chatId: string) => dispatch(removeChat(chatId)),
    setActiveChatId: (chatId: string) => dispatch(setActiveChatId(chatId)),
    removeActiveChatId: () => dispatch(removeActiveChatId()),
    setStarted: (value: boolean) => dispatch(setStarted(value)),
    updateChatTitle: (chatId: string, newTitle: string) =>
      dispatch(updateChatTitle({ chatId, newTitle })),
    setConversation: (data: ChatSessionData[] | null) =>
      dispatch(setConversation(data)),
  };
};
