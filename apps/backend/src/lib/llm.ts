import OpenAI from 'openai'
import type { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Stream text from OpenAI, yielding tokens as they arrive
 */
export async function* streamText(
  messages: ChatMessage[],
  options?: { model?: string; temperature?: number; maxTokens?: number }
): AsyncGenerator<{ type: 'token' | 'done'; content?: string; totalTokens?: number }> {
  const model = options?.model || 'gpt-4o-mini'

  const stream = await openai.chat.completions.create({
    model,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 2048,
    stream: true,
  })

  let totalContent = ''

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (content) {
      totalContent += content
      yield { type: 'token', content }
    }
  }

  yield { type: 'done', content: totalContent }
}

/**
 * Generate a single text completion (non-streaming)
 */
export async function generateText(
  messages: ChatMessage[],
  options?: { model?: string; temperature?: number; maxTokens?: number }
): Promise<{ content: string; inputTokens: number; outputTokens: number }> {
  const model = options?.model || 'gpt-4o-mini'

  const response = await openai.chat.completions.create({
    model,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 2048,
  })

  return {
    content: response.choices[0]?.message?.content || '',
    inputTokens: response.usage?.prompt_tokens || 0,
    outputTokens: response.usage?.completion_tokens || 0,
  }
}

/**
 * Extract structured data using JSON mode + Zod parsing
 */
export async function extractStructuredData<T>(
  messages: ChatMessage[],
  schema: z.ZodSchema<T>,
  options?: { model?: string; temperature?: number }
): Promise<{ data: T; inputTokens: number; outputTokens: number }> {
  const model = options?.model || 'gpt-4o-mini'

  const response = await openai.chat.completions.create({
    model,
    messages,
    temperature: options?.temperature ?? 0.3,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content || '{}'
  const parsed = JSON.parse(content)
  const validated = schema.parse(parsed)

  return {
    data: validated,
    inputTokens: response.usage?.prompt_tokens || 0,
    outputTokens: response.usage?.completion_tokens || 0,
  }
}
