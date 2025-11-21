import ChatArea from './ChatArea'
import Sidebar from './Sidebar'

const ChatPage = () => {
  return (
    <div className="flex h-screen w-full bg-slate-950 font-sans overflow-hidden">
      <Sidebar />
      <ChatArea />
    </div>
  );
};

export default ChatPage;