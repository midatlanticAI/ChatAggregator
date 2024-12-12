'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { SendHorizontal } from 'lucide-react';
import type { ChatInputProps } from '@/types/chat';

export function ChatInput({ onSend, isLoading, disabled }: ChatInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isLoading) return;
    
    onSend(content.trim());
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled || isLoading}
          className="min-h-[44px] max-h-[200px] resize-none"
          rows={1}
        />
        <Button 
          type="submit" 
          disabled={!content.trim() || disabled || isLoading}
          className="shrink-0"
        >
          <SendHorizontal className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </form>
  );
} 