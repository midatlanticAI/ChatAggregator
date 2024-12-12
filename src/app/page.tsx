'use client';

import { ChatHeader, ChatContainer, Sidebar } from '@/components/chat';
import { useChat } from '@/hooks/useChat';

export default function Home() {
  const {
    provider,
    setProvider,
    model,
    setModel,
    createNewChat,
    isSidebarOpen,
    setIsSidebarOpen,
    chats,
    currentChatId,
    setCurrentChatId,
    updateChatTitle,
    deleteChat
  } = useChat();

  return (
    <main className="flex h-screen">
      <Sidebar 
        isOpen={isSidebarOpen}
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={setCurrentChatId}
        onUpdateTitle={updateChatTitle}
        onDeleteChat={deleteChat}
      />
      <div className="flex flex-col flex-1">
        <ChatHeader
          provider={provider}
          setProvider={setProvider}
          model={model}
          setModel={setModel}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <div className="flex-1 overflow-hidden">
          <ChatContainer 
            provider={provider}
            model={model}
          />
        </div>
      </div>
    </main>
  );
} 