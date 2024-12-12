'use client';

import { useState, useCallback, useEffect } from 'react';
import { nanoid } from 'nanoid';
import type { Chat, Message, ModelProvider, ModelName } from '@/types/chat';

const STORAGE_KEY = 'ai-chat-history';
const SIDEBAR_KEY = 'sidebar-state';
const MAX_MESSAGES = 10;

export function useChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeProviders, setActiveProviders] = useState<Set<ModelProvider>>(new Set());
  const [error, setError] = useState<Error | null>(null);
  const [provider, setProvider] = useState<ModelProvider>('openai');
  const [model, setModel] = useState<ModelName>('gpt-4o');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(SIDEBAR_KEY);
    return stored ? JSON.parse(stored) : false;
  });

  // Load chats on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedChats = JSON.parse(stored).map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setChats(parsedChats);

        if (parsedChats.length > 0) {
          const recent = parsedChats[0];
          setCurrentChatId(recent.id);
          setMessages(recent.messages);
          setProvider(recent.provider);
          setModel(recent.model);
        }
      } catch (err) {
        console.error('Error loading chats:', err);
      }
    }
  }, []);

  // Save chats when they change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    }
  }, [chats]);

  // Save sidebar state when it changes
  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const selectChat = useCallback((chatId: string) => {
    const selectedChat = chats.find(chat => chat.id === chatId);
    if (!selectedChat) return;

    setCurrentChatId(chatId);
    setMessages(selectedChat.messages);
    setProvider(selectedChat.provider);
    setModel(() => selectedChat.model as ModelName);
  }, [chats]);

  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: nanoid(),
      title: 'New Chat',
      messages: [],
      provider: 'openai',
      model: 'gpt-4o',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setMessages([]); // Clear messages first
    setChats(prev => [newChat, ...prev]); // Add new chat to start of list
    setCurrentChatId(newChat.id); // Set as current chat
    setProvider('openai');
    setModel('gpt-4o');
    setError(null);

    return newChat.id;
  }, []);

  const sendMessage = useCallback(async (
    content: string,
    currentProvider: ModelProvider,
    currentModel: ModelName
  ) => {
    if (!currentChatId) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const userMessage: Message = {
        id: nanoid(),
        content,
        role: 'user',
        timestamp: new Date(),
        provider: currentProvider,
      };
      
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      if (currentProvider === 'all') {
        const providers = [
          { provider: 'openai', model: 'gpt-4o' },
          { provider: 'anthropic', model: 'claude-3-5-sonnet-latest' },
          { provider: 'gemini', model: 'gemini-pro' }
        ] as const;

        for (const config of providers) {
          setActiveProviders(prev => {
            const newSet = new Set(Array.from(prev));
            newSet.add(config.provider as ModelProvider);
            return newSet;
          });

          try {
            const response = await fetch(`/api/${config.provider}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                messages: updatedMessages.slice(-5),
                model: config.model,
                provider: config.provider,
              }),
            });

            if (!response.ok) continue;

            const data = await response.json();
            
            const assistantMessage: Message = {
              id: nanoid(),
              content: data.message,
              role: 'assistant',
              timestamp: new Date(),
              provider: config.provider as ModelProvider,
            };

            setMessages(prev => [...prev, assistantMessage]);
          } catch (error) {
            console.error(`Error with ${config.provider}:`, error);
          } finally {
            setActiveProviders(prev => {
              const newSet = new Set(Array.from(prev));
              newSet.delete(config.provider as ModelProvider);
              return newSet;
            });
          }
        }
      } else {
        setActiveProviders(new Set([currentProvider]));
        
        const response = await fetch(`/api/${currentProvider}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedMessages.slice(-5),
            model: currentModel,
            provider: currentProvider,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();

        const assistantMessage: Message = {
          id: nanoid(),
          content: data.message,
          role: 'assistant',
          timestamp: new Date(),
          provider: currentProvider,
        };

        setMessages([...updatedMessages, assistantMessage]);
        setActiveProviders(new Set());
      }

    } catch (err) {
      console.error('Error in sendMessage:', err);
      setError(err instanceof Error ? err : new Error('Failed to send message'));
    } finally {
      setIsLoading(false);
      setActiveProviders(new Set());
    }
  }, [currentChatId, messages]);

  const updateChatTitle = useCallback((chatId: string, title: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { 
            ...chat, 
            title, 
            updatedAt: new Date() 
          }
        : chat
    ));
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    setChats(prev => {
      const newChats = prev.filter(chat => chat.id !== chatId);
      
      // If deleting current chat, switch to another one
      if (currentChatId === chatId) {
        if (newChats.length > 0) {
          const nextChat = newChats[0];
          setCurrentChatId(nextChat.id);
          setMessages(nextChat.messages);
          setProvider(nextChat.provider);
          setModel(nextChat.model);
        } else {
          // If no chats left, create a new one
          createNewChat();
        }
      }
      
      return newChats;
    });
  }, [currentChatId, createNewChat]);

  // Add clearChat function
  const clearChat = useCallback(() => {
    if (!currentChatId) return;

    // Clear messages for current chat
    setMessages([]);
    
    // Update chat in storage
    setChats(prev => prev.map(chat => 
      chat.id === currentChatId 
        ? {
            ...chat,
            messages: [],
            updatedAt: new Date(),
          }
        : chat
    ));

    // Save to localStorage
    const updatedChats = chats.map(chat => 
      chat.id === currentChatId 
        ? { ...chat, messages: [], updatedAt: new Date() }
        : chat
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChats));
  }, [currentChatId, chats]);

  const handleChatUpdate = (nextChat: Chat) => {
    setMessages(nextChat.messages);
    setProvider(nextChat.provider);
    setModel(() => nextChat.model as ModelName);
  };

  const handleSetModel = useCallback((newModel: ModelName) => {
    setModel(newModel);
  }, []);

  return {
    chats,
    currentChatId,
    setCurrentChatId: selectChat,
    createNewChat,
    updateChatTitle,
    deleteChat,
    clearChat,
    messages,
    isLoading,
    activeProviders,
    error,
    provider,
    setProvider,
    model,
    setModel: handleSetModel,
    sendMessage,
    isSidebarOpen,
    setIsSidebarOpen,
  };
} 