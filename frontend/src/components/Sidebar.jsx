import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Bot, 
  User, 
  X,
  Sparkles
} from 'lucide-react';
import useChatStore from '../store/chatStore'; // Adjust path if needed

const Sidebar = () => {
  const { chats, activeChatId, createChat, fetchChatList, selectChat } = useChatStore();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const inputRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isModalOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 50);
    }
  }, [isModalOpen]);

  // Handle Keyboard Shortcuts (Esc to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    if (isModalOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  useEffect(() => {
    fetchChatList();
  }, [fetchChatList]);

  const openModal = () => {
    setIsModalOpen(true);
    setNewChatName('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewChatName('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newChatName.trim()) return;
    
    createChat(newChatName);
    closeModal();
  };

  return (
    <>
      {/* ------------------- MAIN SIDEBAR ------------------- */}
      <div className="w-80 bg-slate-950 border-r border-slate-800 flex flex-col h-full transition-all duration-300 relative z-10">
        
        {/* App Header */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Bot className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Nexus AI</h1>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={openModal}
            className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all duration-200 shadow-lg shadow-blue-900/20 group border border-blue-500/50"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span className="font-medium">Create New Chat</span>
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          <div className="px-3 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between items-center">
            <span>Your Chats</span>
            <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full">{chats.length}</span>
          </div>
          
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => selectChat(chat.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group border ${
                activeChatId === chat.id
                  ? 'bg-slate-800/80 border-slate-700 text-white shadow-md'
                  : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <MessageSquare className={`w-4 h-4 shrink-0 ${activeChatId === chat.id ? 'text-blue-400' : 'text-slate-600'}`} />
              <div className="flex-1 min-w-0">
                <span className="block truncate font-medium text-sm">{chat.title}</span>
                <span className="block truncate text-[10px] text-slate-600 font-mono mt-0.5 opacity-80">ID: {chat.id}</span>
              </div>
            </button>
          ))}
        </div>

        {/* User Profile / Footer */}
        <div className="p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3 px-2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-slate-600">
              <User className="w-4 h-4" />
            </div>
            <div className="text-sm font-medium">Frontend Dev</div>
          </div>
        </div>
      </div>

      {/* ------------------- CUSTOM MODAL ------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>

          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold">New Session</h3>
              </div>
              <button 
                onClick={closeModal}
                className="text-slate-500 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Chat Name
              </label>
              <input
                ref={inputRef}
                type="text"
                value={newChatName}
                onChange={(e) => setNewChatName(e.target.value)}
                placeholder="e.g., React Project Research..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
              
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newChatName.trim()}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 transition-all"
                >
                  Create Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;