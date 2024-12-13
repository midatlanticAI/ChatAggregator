# Building a Multi-Model Chat Application

A comprehensive guide to building a chat application that interfaces with multiple AI models. This tutorial includes code snippets, best practices, common pitfalls, and lessons learned during development.

## Prerequisites

* Node.js 18+ installed
* Basic knowledge of React and Next.js
* API keys for:
  * OpenAI (GPT-4)
  * Anthropic (Claude)
  * Google AI Studio (Gemini)

## Step 1: Project Setup

1. Create a new Next.js project with TypeScript and Tailwind:
```bash
npx create-next-app@latest tutorial --typescript --tailwind --app
cd tutorial
```

2. Install required dependencies:
```bash
npm install @anthropic-ai/sdk @google/generative-ai openai
npm install @radix-ui/react-dropdown-menu @radix-ui/react-slot @radix-ui/react-tooltip
npm install class-variance-authority clsx lucide-react tailwind-merge
```

3. Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
GOOGLE_API_KEY=your_google_key_here
```

### Important Setup Notes
- Always add `.env` to your `.gitignore`
- Use `.env.example` to document required environment variables
- Consider using `zod` for environment variable validation

## Step 2: API Routes Implementation

### OpenAI Route

```typescript:src/app/api/openai/route.ts
import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Request proper format validation
    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid request format', { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      stream: true,
    });

    // Create a streaming response
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
    
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    return new Response(error.message || 'Error processing request', {
      status: error.status || 500,
    });
  }
}
```

### Anthropic Route
```typescript:src/app/api/anthropic/route.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid request format', { status: 400 });
    }

    // Convert chat format to Claude's expected format
    const messageContent = messages.map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      messages: [{ role: 'user', content: messageContent }],
    });

    return new Response(JSON.stringify(response.content), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Anthropic API Error:', error);
    return new Response(error.message || 'Error processing request', {
      status: error.status || 500,
    });
  }
}
```

### Gemini Route
```typescript:src/app/api/gemini/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid request format', { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Convert chat format to Gemini's expected format
    const chat = model.startChat({
      history: messages.map(msg => ({
        role: msg.role,
        parts: msg.content,
      })),
    });

    const result = await chat.sendMessage(messages[messages.length - 1].content);
    const response = await result.response;

    return new Response(JSON.stringify({ content: response.text() }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return new Response(error.message || 'Error processing request', {
      status: error.status || 500,
    });
  }
}
```

## Step 3: Project Structure

Create the following directory structure:
```
tutorial/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── anthropic/
│   │   │   │   └── route.ts
│   │   │   ├── gemini/
│   │   │   │   └── route.ts
│   │   │   └── openai/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── components/
│       ├── chat-input.tsx
│       ├── chat-message.tsx
│       └── chat-window.tsx
```

## Step 4: Components Implementation

### Chat Message Component
```typescript:src/components/chat-message.tsx
import { FC } from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

export const ChatMessage: FC<ChatMessageProps> = ({ role, content, model }) => {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] rounded-lg p-4 ${
        role === 'user' 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200 text-black'
      }`}>
        {model && <div className="text-xs opacity-50 mb-1">{model}</div>}
        <div className="whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  );
};
```

### Chat Input Component
```typescript:src/components/chat-input.tsx
import { FC, FormEvent, useState } from 'react';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: FC<ChatInputProps> = ({ onSubmit, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmit(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled}
          className="flex-1 p-2 border rounded"
          placeholder="Type your message..."
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </form>
  );
};
```

### Main Page Implementation
```typescript:src/app/page.tsx
'use client';

import { useState } from 'react';
import { ChatMessage } from '@/components/chat-message';
import { ChatInput } from '@/components/chat-input';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'openai' | 'anthropic' | 'gemini'>('openai');

  const handleSendMessage = async (content: string) => {
    try {
      setLoading(true);
      
      // Add user message
      const userMessage: Message = { role: 'user', content };
      setMessages(prev => [...prev, userMessage]);

      // Send to selected API
      const response = await fetch(`/api/${selectedModel}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      // Add AI response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content,
        model: selectedModel
      }]);

    } catch (error) {
      console.error('Error:', error);
      // Add error message to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.',
        model: selectedModel
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto max-w-4xl h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <ChatMessage key={index} {...message} />
        ))}
      </div>
      
      <div className="border-t">
        <div className="p-4 flex justify-center gap-4">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as any)}
            className="p-2 border rounded"
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Claude</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>
        <ChatInput onSubmit={handleSendMessage} disabled={loading} />
      </div>
    </main>
  );
}
```

### Lessons Learned & Best Practices

1. **API Error Handling**
   - Always implement proper error boundaries
   - Provide user-friendly error messages
   - Log errors server-side for debugging

2. **State Management**
   - Keep message history in state
   - Handle loading states properly
   - Implement proper TypeScript interfaces

3. **Common Pitfalls**
   - Not handling API rate limits
   - Missing error states in UI
   - Forgetting to handle loading states

4. **Performance Considerations**
   - Implement message virtualization for long chats
   - Handle API timeouts gracefully
   - Consider implementing message batching

5. **Security Best Practices**
   - Never expose API keys client-side
   - Validate input server-side
   - Implement rate limiting
   - Sanitize output from AI models

### Debugging Tips

1. **API Issues**
   ```typescript
   // Add detailed logging in API routes
   console.error('API Error:', {
     error,
     requestBody: messages,
     statusCode: error.status
   });
   ```

2. **State Management Issues**
   ```typescript
   // Use React DevTools
   useEffect(() => {
     console.log('Messages updated:', messages);
   }, [messages]);
   ```

### Future Improvements

1. **Streaming Responses**
   - Implement streaming for all models
   - Show typing indicators
   - Handle partial responses

2. **Enhanced Error Handling**
   - Retry logic for failed requests
   - Graceful degradation
   - Better error messages

3. **UI Enhancements**
   - Message timestamps
   - Read receipts
   - Markdown support
   - Code highlighting

4. **Performance Optimizations**
   - Message pagination
   - Lazy loading
   - Response caching

## Step 5: Model Integration

1. Set up API clients for each model
2. Implement message handling
3. Add error handling and response processing

## Step 6: User Interface

1. Create the chat interface
2. Add model selection
3. Implement message display
4. Add the input field

## Step 7: Testing

1. Test each model individually
2. Verify error handling
3. Check message display and formatting

## Troubleshooting

### Common Issues

1. EPERM Error on Windows:
   - Close terminal
   - Run as Administrator
   - Kill Node processes: `taskkill /F /IM node.exe`
   - Restart server: `npm run dev`

2. API Key Issues:
   - Verify keys are properly set in .env
   - Check for spaces or quotes in key values
   - Ensure .env is in root directory

## Next Steps

After completing the basic setup, you can enhance the application with:
1. Message history
2. Better error handling
3. Loading states
4. Response streaming

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com)
- [Google AI Documentation](https://ai.google.dev/docs) 