'use client';

import React from 'react';
import { Copy, Check, User, Bot } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import type { Message } from '@/types/chat';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    console.log('Rendering message:', message);
  }, [message]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMessageStyles = () => {
    if (message.role === 'user') {
      return 'bg-purple-500 text-white ml-auto';
    }
    // Different background colors for different providers
    const providerColors: Record<string, string> = {
      openai: 'bg-green-50 border border-green-100',
      anthropic: 'bg-blue-50 border border-blue-100',
      gemini: 'bg-orange-50 border border-orange-100'
    };
    return `${providerColors[message.provider || 'openai']} text-gray-800`;
  };

  return (
    <div 
      className={`flex gap-2 items-start ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
      key={`${message.id}-${message.timestamp.getTime()}`}
    >
      {/* Avatar/Icon */}
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
        ${message.role === 'user' ? 'order-2 bg-purple-600' : 'bg-gray-100'}
      `}>
        {message.role === 'user' ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-gray-600" />
        )}
      </div>

      {/* Message Bubble */}
      <div className={`
        relative group max-w-[85%] md:max-w-[75%] px-4 py-3 rounded-2xl
        ${getMessageStyles()}
      `}>
        {/* Provider badge */}
        {message.provider && message.role === 'assistant' && (
          <div className={`
            absolute -top-2 left-4 px-2 py-0.5 rounded-full text-xs font-medium
            ${message.provider === 'openai' ? 'bg-green-100 text-green-700' : ''}
            ${message.provider === 'anthropic' ? 'bg-blue-100 text-blue-700' : ''}
            ${message.provider === 'gemini' ? 'bg-orange-100 text-orange-700' : ''}
          `}>
            {message.provider.toUpperCase()}
          </div>
        )}

        <div className="relative">
          {/* Copy button */}
          <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className={`h-8 w-8 rounded-full ${
                      message.role === 'user' 
                        ? 'text-white hover:bg-white/20' 
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copied ? 'Copied!' : 'Copy message'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Timestamp */}
          <div className={`text-xs mb-1 ${
            message.role === 'user' 
              ? 'text-white/70' 
              : 'text-gray-500'
          }`}>
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>

          {/* Message text */}
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
} 