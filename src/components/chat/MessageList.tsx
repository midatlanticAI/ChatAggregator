'use client';

import React from 'react';
import { MessageBubble } from './MessageBubble';
import type { Message } from '@/types/chat';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Debug render
  React.useEffect(() => {
    console.log('MessageList rendering with messages:', messages);
  }, [messages]);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Force clear messages when empty
  React.useEffect(() => {
    if (messages.length === 0) {
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    }
  }, [messages.length]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-y-auto scrollbar-gutter-stable"
      style={{ overscrollBehavior: 'contain' }}
    >
      <div className="min-h-full p-4">
        {(!messages || messages.length === 0) ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center space-y-2">
              <h3 className="font-medium">Start a New Conversation</h3>
              <p className="text-sm text-gray-400">
                Ask questions and get perspectives from multiple AI models
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <MessageBubble 
                key={`${message.id}-${message.timestamp.getTime()}`} 
                message={message} 
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
} 