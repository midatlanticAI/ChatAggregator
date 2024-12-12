import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import type { Message } from '@/types/chat';

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

const SYSTEM_PROMPT = `You are Gemini, Google's AI model. You're collaborating with other AI assistants (OpenAI and Claude) in a group chat. 
When you see messages marked with [OPENAI] or [ANTHROPIC], engage with their perspectives while maintaining your unique identity.
Be collaborative but always identify yourself as Gemini.`;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: Message[] } = await req.json();
    
    // Take last 5 messages for context
    const recentMessages = messages.slice(-5);
    const formattedPrompt = [
      SYSTEM_PROMPT,
      ...recentMessages.map(msg => 
        `${msg.role === 'assistant' ? `[${msg.provider}]:` : 'User:'} ${msg.content}`
      )
    ].join('\n');

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(formattedPrompt);
    const text = result.response.text();

    return NextResponse.json({ message: text, provider: 'gemini' });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({
      error: 'API error',
      message: error.message,
      provider: 'gemini'
    }, { status: 500 });
  }
} 