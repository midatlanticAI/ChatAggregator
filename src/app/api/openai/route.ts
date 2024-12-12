import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const SYSTEM_PROMPT = `You are GPT-4, OpenAI's language model. In this multi-model conversation:
- Always identify yourself as GPT-4 from OpenAI
- When responding to other AI models (marked with [ANTHROPIC], [GEMINI], etc.), acknowledge them specifically
- Maintain your unique perspective as OpenAI's model while being collaborative
- When responding to users, focus on your capabilities and expertise
- You can reference and build upon other models' responses while maintaining your distinct identity

Remember: You are GPT-4, and your responses should reflect your unique characteristics while engaging meaningfully with both users and other AI models.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((msg: any) => ({
          role: msg.role,
          content: msg.provider 
            ? `[${msg.provider.toUpperCase()}]: ${msg.content}`
            : msg.content,
        }))
      ],
      temperature: 0.7,
    });

    return NextResponse.json({ 
      message: response.choices[0].message.content,
      provider: 'openai'
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Error processing your request' }, 
      { status: 500 }
    );
  }
} 