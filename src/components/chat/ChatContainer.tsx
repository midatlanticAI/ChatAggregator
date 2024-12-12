'use client';

import React from 'react';
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";
import { useChat } from '@/hooks/useChat';
import { Button } from '../ui/button';
import type { ModelProvider, ModelName } from '@/types/chat';

interface ChatContainerProps {
  provider: ModelProvider;
  model: ModelName;
}

export function ChatContainer({ 
  provider: selectedProvider, 
  model: selectedModel 
}: ChatContainerProps) {
  const { 
    messages, 
    isLoading, 
    activeProviders,
    sendMessage, 
    error,
    currentChatId,
    clearChat 
  } = useChat();

  const handleSendMessage = async (content: string) => {
    if (!currentChatId) return;
    await sendMessage(content, selectedProvider, selectedModel);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center px-4 py-2 border-b">
        <h2 className="text-lg font-semibold">Chat</h2>
        <div className="flex items-center gap-2">
          {activeProviders.size > 0 && (
            <div className="text-sm text-muted-foreground">
              Processing: {Array.from(activeProviders).join(', ')}
            </div>
          )}
          <Button 
            variant="ghost" 
            onClick={clearChat}
            disabled={!currentChatId || isLoading}
          >
            Clear Chat
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <MessageList messages={messages} />
      </div>
      <div className="flex-shrink-0">
        <ChatInput 
          onSend={handleSendMessage} 
          isLoading={isLoading} 
          disabled={!currentChatId}
        />
        {error && (
          <div className="p-4 bg-red-50 text-red-500 text-sm">
            {error.message}
          </div>
        )}
      </div>
    </div>
  );
} 