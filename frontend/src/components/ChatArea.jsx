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


const ChatArea = () => {
  const { chats, activeChatId, addMessage } = useChatStore();
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const activeChat = chats.find((c) => c.id === activeChatId);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, isTyping]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!inputValue.trim() && !selectedImage) || !activeChatId) return;

    // 1. Add User Message
    addMessage(activeChatId, 'user', inputValue, selectedImage);
    const tempInput = inputValue; // store for RAG context
    setInputValue("");
    setSelectedImage(null);
    setIsTyping(true);

    // 2. Simulate RAG/LLM Interaction
    setTimeout(() => {
      addMessage(activeChatId, 'ai', `I have analyzed your request regarding "${tempInput || 'the image'}" based on the uploaded knowledge base. Here is the relevant information...`);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeChat) return <div className="flex-1 bg-slate-900" />;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 relative">
      
      {/* Top Bar */}
      <div className="h-16 border-b border-slate-800/50 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md z-10">
        <div>
          <h2 className="text-lg font-bold text-white">{activeChat.name}</h2>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            RAG Model Active
          </p>
        </div>
        <div className="flex gap-4">
            <button className="text-slate-400 hover:text-white transition-colors">
                <Search className="w-5 h-5" />
            </button>
            <button className="text-slate-400 hover:text-white transition-colors">
                <MoreVertical className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
        {activeChat.messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                <Bot className="w-16 h-16 mb-4" />
                <p>Start a conversation with the AI</p>
            </div>
        )}
        
        {activeChat.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-blue-600' : 'bg-emerald-600'
            }`}>
              {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
            </div>

            {/* Bubble */}
            <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
              }`}>
                {msg.image && (
                  <img 
                    src={msg.image} 
                    alt="Uploaded content" 
                    className="mb-3 rounded-lg max-h-60 border border-white/10 object-cover" 
                  />
                )}
                <p>{msg.content}</p>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">
                {new Date(msg.id).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
           <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none flex items-center gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
              </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-slate-900 border-t border-slate-800">
        {selectedImage && (
          <div className="mb-3 relative inline-block group">
            <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-slate-600" />
            <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Plus className="w-3 h-3 rotate-45" />
            </button>
          </div>
        )}
        
        <div className="relative flex items-end gap-2 bg-slate-800/50 border border-slate-700 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all shadow-lg">
          
          {/* Upload Button */}
          <button 
            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-all"
            title="Upload Document/Image"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageUpload}
          />

          {/* Text Input */}
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none resize-none max-h-32 py-2 text-sm custom-scrollbar"
            rows={1}
            style={{ minHeight: '40px' }}
          />

          {/* Send Button */}
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim() && !selectedImage}
            className={`p-2 rounded-lg transition-all duration-200 ${
              inputValue.trim() || selectedImage 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500' 
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-600 mt-3">
            AI may display inaccurate info, including about people, so double-check its responses.
        </p>
      </div>
    </div>
  );
};

export default ChatArea