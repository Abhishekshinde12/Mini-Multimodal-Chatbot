import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware'

const useChatStore = create(
  persist((set, get) => ({
    chats: [],
    activeChatId: null,
    isLoading: false,
    isUploading: false,
    error: null,

    // 1. Fetch Chat List
    fetchChatList: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch(`/chat/fetch_chat_list/`);
        if (!response.ok) throw new Error('Failed to fetch chats');
        const data = await response.json();
        // Assuming backend returns array of { id, name, ... }
        set({ chats: data, isLoading: false });
        console.log(chats)
      } catch (error) {
        set({ error: error.message, isLoading: false });
      }
    },

    // 2. Create New Chat
    createChat: async (title) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch(`/chat/new_chat/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        });
        if (!response.ok) throw new Error('Failed to create chat');

        const newChat = await response.json();

        set((state) => ({
          chats: [newChat, ...state.chats],
          activeChatId: newChat.id,
          isLoading: false
        }));
      } catch (error) {
        set({ error: error.message, isLoading: false });
      }
    },

    // 3. Fetch Old Chat Messages (Select Chat)
    selectChat: async (chatId) => {
      set({ activeChatId: chatId, isLoading: true, error: null });
      try {
        const response = await fetch(`/chat/fetch_messages/${chatId}/`);
        if (!response.ok) throw new Error('Failed to load messages');

        const messages = await response.json();

        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId ? { ...c, messages: messages } : c
          ),
          isLoading: false
        }));
      } catch (error) {
        set({ error: error.message, isLoading: false });
      }
    },

    // 4. Upload Files
    uploadFile: async (chatId, file) => {
      set({ isUploading: true, error: null });
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`/chat/upload_files/${chatId}/`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('File upload failed');

        const result = await response.json();
        set({ isUploading: false });
        return result; 
      } catch (error) {
        set({ error: error.message, isUploading: false });
        throw error;
      }
    },

    // 5. Send Query
    sendQuery: async (chatId, content) => {
      const tempId = Date.now();
      set((state) => ({
        chats: state.chats.map((chat) => {
          if (chat.id === chatId) {
            const currentMessages = Array.isArray(chat.messages) ? chat.messages : []
            return {
              ...chat,
              messages: [...(chat.messages || []), { id: tempId, user_type: 'user', text: content }]
            };
          }
          return chat;
        })
      }));

      try {
        const response = await fetch(`/chat/query/${chatId}/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: content }),
        });

        if (!response.ok) throw new Error('Failed to get response');

        const aiResponse = await response.json(); 

        // Update store with actual AI response
        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: [...chat.messages,
                {
                  id: aiResponse.id || Date.now(),
                  user_type: 'llm',
                  text: aiResponse.text || aiResponse.content || aiResponse.answer
                }
                ]
              };
            }
            return chat;
          })
        }));
      } catch (error) {
        // Handle error (maybe add an error message to the chat)
        set({ error: error.message });
      }
    },
  }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => sessionStorage)
    })


);

export default useChatStore;