'use client';

import { Chat } from '@/types/chat';
import { Button } from '../ui/button';
import { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onUpdateTitle: (chatId: string, title: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export function Sidebar({
  isOpen,
  chats,
  currentChatId,
  onSelectChat,
  onUpdateTitle,
  onDeleteChat
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <aside className="w-64 bg-purple-600 text-white h-full overflow-y-auto flex flex-col">
      <div className="flex flex-col gap-1 p-2">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`group flex items-center gap-2 p-2 rounded-lg transition-colors
              ${chat.id === currentChatId 
                ? 'bg-purple-700 hover:bg-purple-800' 
                : 'hover:bg-purple-700/50'}`}
          >
            {editingId === chat.id ? (
              <input
                type="text"
                value={chat.title}
                onChange={(e) => onUpdateTitle(chat.id, e.target.value)}
                onBlur={() => setEditingId(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setEditingId(null);
                  }
                }}
                autoFocus
                className="flex-1 bg-purple-800/50 text-white placeholder-purple-300 
                  border border-purple-500 rounded px-2 py-1 text-sm
                  focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            ) : (
              <div
                className="flex-1 truncate text-sm cursor-pointer"
                onClick={() => onSelectChat(chat.id)}
                onDoubleClick={() => setEditingId(chat.id)}
              >
                {chat.title}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(chat.id);
              }}
              className="opacity-0 group-hover:opacity-100 hover:bg-purple-800/50 
                text-white h-6 w-6 p-0 rounded-full"
            >
              <span className="sr-only">Delete chat</span>
              ×
            </Button>
          </div>
        ))}
      </div>
    </aside>
  );
} 