import { NextRequest, NextResponse } from 'next/server';

// Placeholder API keys (replace with real environment variables in production)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'OPENAI_API_KEY_PLACEHOLDER';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'ANTHROPIC_API_KEY_PLACEHOLDER';

export async function POST(req: NextRequest) {
  try {
    const { messages, context, model } = await req.json();
    const userContext = `Context: ${context}`;

    // Basic mock if no real key provided
    if (OPENAI_API_KEY.includes('PLACEHOLDER') && ANTHROPIC_API_KEY.includes('PLACEHOLDER')) {
      return NextResponse.json({ reply: 'AI placeholder response. Configure real API keys.' });
    }

    if (model === 'claude-3.5-sonnet') {
      const reply = await callAnthropic(messages, userContext);
      return NextResponse.json({ reply });
    } else {
      const reply = await callOpenAI(messages, userContext, model);
      return NextResponse.json({ reply });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 });
  }
}

async function callOpenAI(messages: any[], context: string, model: string): Promise<string> {
  const body = {
    model: model === 'gpt-4o-mini' ? 'gpt-4o-mini' : 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a concise, clear quantum mechanics tutor.' },
      { role: 'system', content: context },
      ...messages
    ],
    temperature: 0.7
  };
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'No answer';
}

async function callAnthropic(messages: any[], context: string): Promise<string> {
  const prompt = `${context}\n\n` + messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
  const body = {
    model: 'claude-3-5-sonnet-20240620',
    max_tokens: 300,
    messages: [
      { role: 'user', content: prompt }
    ]
  };
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return data.content?.[0]?.text || 'No answer';
}
