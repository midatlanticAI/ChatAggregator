'use client';

import React from 'react';
import { format } from 'date-fns';
import { Plus, MessageSquare, Edit2, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Chat } from '@/types/chat';

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onUpdateTitle: (chatId: string, title: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export function ChatSidebar({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onUpdateTitle,
  onDeleteChat,
}: ChatSidebarProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState('');
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const handleChatSelect = (chatId: string) => {
    console.log('Selecting chat from sidebar:', chatId);
    onSelectChat(chatId);
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-50">
      <div className="p-3">
        <Button 
          onClick={onNewChat}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No chats yet. Start a new conversation!
          </div>
        ) : (
          <div className="space-y-0.5">
            {chats.map(chat => (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat.id)}
                className={`
                  group px-3 py-2 cursor-pointer
                  hover:bg-gray-100 transition-colors
                  ${chat.id === currentChatId ? 'bg-gray-100' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MessageSquare className="w-4 h-4 shrink-0 text-gray-500" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">
                        {chat.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(chat.updatedAt, 'MMM d, h:mm a')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(chat.id);
                        setEditTitle(chat.title);
                      }}
                      className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 