import dotenv from 'dotenv';

dotenv.config();

let openaiClient = null;

async function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) return null;
  if (openaiClient) return openaiClient;
  try {
    const { OpenAI } = await import('openai');
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openaiClient;
  } catch (err) {
    console.error('Failed to initialize OpenAI client:', err.message);
    return null;
  }
}

export async function generateAIResponse(systemPrompt, userPrompt, opts = {}) {
  const client = await getOpenAI();
  if (!client) {
    return {
      content: opts.fallback || 'AI service unavailable. Add OPENAI_API_KEY to enable AI features.',
      model: 'mock',
    };
  }

  try {
    const completion = await client.chat.completions.create({
      model: opts.model || 'gpt-3.5-turbo',
      temperature: opts.temperature ?? 0.4,
      max_tokens: opts.maxTokens || 400,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    return {
      content: completion.choices[0].message.content,
      model: completion.model,
      usage: completion.usage,
    };
  } catch (err) {
    console.error('AI generation error:', err.message);
    return {
      content: opts.fallback || 'AI request failed. Please try again later.',
      model: 'error',
    };
  }
}
