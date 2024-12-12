'use client';

import { Button } from "@/components/ui/button";
import { ModelProvider, ModelName } from "@/types/chat";

const PROVIDER_CONFIG = {
  openai: {
    name: 'OpenAI',
    model: 'gpt-4o',
    modelLabel: 'GPT-4 Turbo'
  },
  anthropic: {
    name: 'Anthropic',
    model: 'claude-3-5-sonnet-latest',
    modelLabel: 'Claude 3.5 Sonnet'
  },
  gemini: {
    name: 'Gemini',
    model: 'gemini-pro',
    modelLabel: 'Gemini Pro'
  },
  all: {
    name: 'All Models',
    model: 'all',
    modelLabel: 'All Available Models'
  }
} as const;

interface ChatHeaderProps {
  provider: ModelProvider;
  setProvider: (provider: ModelProvider) => void;
  model: ModelName;
  setModel: (model: ModelName) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function ChatHeader({
  provider,
  setProvider,
  model,
  setModel,
  isSidebarOpen,
  onToggleSidebar
}: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-center gap-2 border-b p-4 bg-background">
      <div className="flex gap-2">
        {Object.entries(PROVIDER_CONFIG).map(([key, config]) => (
          <Button
            key={key}
            variant={provider === key ? "default" : "outline"}
            onClick={() => {
              setProvider(key as ModelProvider);
              if (key !== 'all') {
                setModel(config.model as ModelName);
              }
            }}
            className="px-4 py-2"
          >
            {config.name}
          </Button>
        ))}
      </div>
    </header>
  );
} 