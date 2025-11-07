import { createSlice } from "@reduxjs/toolkit";
import type { ChatMetadata, ChatSessionData } from "@/interface/global";

import type { PayloadAction } from "@reduxjs/toolkit";

interface ChatState {
  chats: ChatMetadata[];
  chat_id: string | null;
  started: boolean;
  conversation: ChatSessionData[] | null;
}

const initialState: ChatState = {
  chats: [],
  chat_id: null,
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
    setChatID: (state, action: PayloadAction<string>) => {
      state.chat_id = action.payload;
    },
    removeChatID: (state) => {
      state.chat_id = null;
    },


    setStarted: (state, action: PayloadAction<boolean>) => {
      state.started = action.payload;
    },
    updateTitle: (
      state,
      action: PayloadAction<{ chatId: string; newTitle: string }>
    ) => {
      const chat = state.chats.find((c) => c.chatId === action.payload.chatId);
      if (chat) {
        chat.title = action.payload.newTitle;
      }
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
  setChatID,
  removeChatID,
  setStarted,
  updateTitle,
  setConversation,
} = chatSlice.actions;

export default chatSlice.reducer;
