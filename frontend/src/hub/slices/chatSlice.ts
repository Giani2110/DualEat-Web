import { createSlice } from "@reduxjs/toolkit";
import type { ChatMetadata, ChatSessionData } from "@/interface/global";

import type { PayloadAction } from "@reduxjs/toolkit";

interface ChatState {
  chats: ChatMetadata[];
  activeChatId: string | null;
  started: boolean;
  conversation: ChatSessionData[] | null;
}

const initialState: ChatState = {
  chats: [],
  activeChatId: null,
  started: false,
  conversation: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<ChatMetadata[]>) => {
      state.chats = action.payload;
    },
    clearChats: (state) => {
      state.chats = [];
    },
    addChat: (state, action: PayloadAction<ChatMetadata>) => {
      state.chats.push(action.payload);
    },
    removeChat: (state, action: PayloadAction<string>) => {
      state.chats = state.chats.filter(
        (chat) => chat.chatId !== action.payload
      );
    },
    setActiveChatId: (state, action: PayloadAction<string>) => {
      state.activeChatId = action.payload;
    },
    removeActiveChatId: (state) => {
      state.activeChatId = null;
    },
    setStarted: (state, action: PayloadAction<boolean>) => {
      state.started = action.payload;
    },
    setConversation: (
      state,
      action: PayloadAction<ChatSessionData[] | null>
    ) => {
      state.conversation = action.payload;
    },
  },
});

export const {
  setChats,
  clearChats,
  addChat,
  removeChat,
  setActiveChatId,
  removeActiveChatId,
  setStarted,
  setConversation,
} = chatSlice.actions;

export default chatSlice.reducer;
