export type ModelName = 'gpt-4o' | 'claude-3-5-sonnet-latest' | 'gemini-pro';
export type ModelProvider = 'openai' | 'anthropic' | 'gemini' | 'all';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  provider: ModelProvider;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  provider: ModelProvider;
  model: ModelName;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatInputProps {
  onSend: (content: string) => void;
  isLoading: boolean;
  disabled: boolean;
}

export class APIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'APIError';
  }
}

export interface ChatHeaderProps {
  provider: ModelProvider;
  setProvider: (provider: ModelProvider) => void;
  model: ModelName;
  setModel: (model: ModelName) => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export interface ChatContainerProps {
  provider: ModelProvider;
  model: ModelName;
}

export interface MessageListProps {
  messages: Message[];
}

export interface MessageBubbleProps {
  message: Message;
} 