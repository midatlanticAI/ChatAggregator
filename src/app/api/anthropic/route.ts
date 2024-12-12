import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000;
const MAX_RETRY_DELAY = 10000;

const SYSTEM_PROMPT = `You are Claude, Anthropic's AI assistant. In this multi-model conversation:
- Always identify yourself as Claude from Anthropic
- When responding to other AI models (marked with [OPENAI], [GEMINI], etc.), acknowledge them directly
- Maintain your unique characteristics and ethical principles while being collaborative
- When responding to users, emphasize your distinct capabilities and approach
- You can build upon other models' insights while staying true to your identity

Remember: You are Claude, and your responses should reflect your unique perspective while engaging thoughtfully with both users and other AI models.`;

async function retryWithExponentialBackoff(fn: () => Promise<any>, retries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY) {
  try {
    return await fn();
  } catch (error: any) {
    if (retries === 0 || error?.error?.error?.type !== 'overloaded_error') {
      throw error;
    }

    const nextDelay = Math.min(delay * 2, MAX_RETRY_DELAY);
    console.log(`Anthropic API overloaded, retrying in ${delay}ms... (${retries} retries left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithExponentialBackoff(fn, retries - 1, nextDelay);
  }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.provider 
        ? `[${msg.provider.toUpperCase()}]: ${msg.content}`
        : msg.content,
    }));

    const response = await retryWithExponentialBackoff(async () => {
      return await anthropic.messages.create({
        model: 'claude-3-5-sonnet-latest',
        system: SYSTEM_PROMPT,
        messages: formattedMessages,
        max_tokens: 1024,
        temperature: 0.7,
      });
    });

    return NextResponse.json({ 
      message: response.content[0].text,
      provider: 'anthropic'
    });
  } catch (error) {
    console.error('Anthropic API error:', error);
    
    // Return a more graceful error response
    return NextResponse.json({
      error: 'Temporarily unavailable',
      provider: 'anthropic',
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      shouldRetry: true
    }, { status: 500 });
  }
} 