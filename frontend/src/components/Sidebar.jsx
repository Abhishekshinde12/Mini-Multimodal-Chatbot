import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Paperclip, 
  Send, 
  Bot, 
  User, 
  Image as ImageIcon,
  MoreVertical,
  Search
} from 'lucide-react';
import useChatStore from '../store/chatStore';

const Sidebar = () => {
  const { chats, activeChatId, setActiveChat, createChat } = useChatStore();

  const handleCreateChat = () => {
    const name = prompt("Enter a name for your new chat session:");
    if (name) createChat(name);
  };

  return (
    <div className="w-80 bg-slate-950 border-r border-slate-800 flex flex-col h-full transition-all duration-300">
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
          onClick={handleCreateChat}
          className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all duration-200 shadow-lg shadow-blue-900/20 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span className="font-medium">Create New Chat</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
        <div className="px-3 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Your Chats
        </div>
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => setActiveChat(chat.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
              activeChatId === chat.id
                ? 'bg-slate-800 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <MessageSquare className={`w-4 h-4 ${activeChatId === chat.id ? 'text-blue-400' : 'text-slate-600'}`} />
            <div className="flex-1 truncate">
              <span className="block truncate font-medium text-sm">{chat.name}</span>
              <span className="text-[10px] text-slate-600 font-mono">ID: {chat.id}</span>
            </div>
          </button>
        ))}
      </div>

      {/* User Profile / Footer */}
      <div className="p-4 border-t border-slate-800/50">
        <div className="flex items-center gap-3 px-2 text-slate-400">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <User className="w-4 h-4" />
          </div>
          <div className="text-sm font-medium">Frontend Dev</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar