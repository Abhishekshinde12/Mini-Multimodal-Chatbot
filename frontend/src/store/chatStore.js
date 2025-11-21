import { create } from 'zustand';

const useChatStore = create((set) => ({
  chats: [
    { 
      id: '1', 
      name: 'Welcome Chat', 
      messages: [
        { id: 1, role: 'ai', content: 'Hello! I am your RAG assistant. Upload a document or ask me anything.', image: null }
      ] 
    }
  ],
  activeChatId: '1',

  // Actions
  setActiveChat: (id) => set({ activeChatId: id }),
  
  createChat: (name) => set((state) => {
    const newChat = {
      id: Date.now().toString(),
      name: name || `New Chat ${state.chats.length + 1}`,
      messages: []
    };
    return { chats: [...state.chats, newChat], activeChatId: newChat.id };
  }),

  addMessage: (chatId, role, content, image = null) => set((state) => ({
    chats: state.chats.map((chat) => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, { id: Date.now(), role, content, image }]
        };
      }
      return chat;
    })
  })),
}))

export default useChatStore;