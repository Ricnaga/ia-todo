import { GoogleGenAI } from '@google/genai'
import { env } from '../../../config/environment'
import { AiUnavailableError } from '../../errors/app.errors'
import { toJsonSchema } from './gemini-schema.mapper'
import type { AiGenerateOptions, AiService } from '../ai.service.interface'

const RETRYABLE_STATUSES = [408, 429, 500, 502, 503, 504]

const RETRY = {
  maxRetries: 2,
  initialDelayMs: 4_000,
  maxDelayMs: 20_000,
} as const

function isAbortError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'ResponseAborted' ||
      error.name === 'AbortError' ||
      error.name === 'APIUserAbortError')
  )
}

function isRetryable(error: unknown): boolean {
  if (isAbortError(error)) return false
  if (!(error instanceof Error)) return false

  const status = (error as { status?: unknown }).status
  if (typeof status === 'number' && RETRYABLE_STATUSES.includes(status)) return true

  const { name, message } = error
  return (
    name === 'APIConnectionError' ||
    name === 'APIConnectionTimeoutError' ||
    name === 'TimeoutError' ||
    /fetch failed/i.test(message) ||
    /connection/i.test(message) ||
    /high demand/i.test(message) ||
    /RESOURCE_EXHAUSTED/i.test(message) ||
    /429|503|overloaded|quota|rate.?limit/i.test(message)
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function retryTransient<T>(work: () => Promise<T>): Promise<T> {
  let attempts = 0

  while (true) {
    try {
      return await work()
    } catch (error) {
      if (attempts >= RETRY.maxRetries || !isRetryable(error)) throw error
      attempts += 1
      const backoff = Math.min(RETRY.initialDelayMs * 2 ** (attempts - 1), RETRY.maxDelayMs)
      await sleep(backoff * (0.5 + Math.random() * 0.5))
    }
  }
}

export class GeminiAiService implements AiService {
  private client: GoogleGenAI | null = null

  private getClient(): GoogleGenAI {
    if (!env.GEMINI_API_KEY) {
      throw new Error(
        'GEMINI_API_KEY não configurada. Defina a variável no arquivo .env para usar os recursos de IA.',
      )
    }

    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })
    }

    return this.client
  }

  async generateStructured<T>({
    systemInstruction,
    prompt,
    schema,
    temperature,
  }: AiGenerateOptions<T>): Promise<T> {
    let interaction

    try {
      interaction = await retryTransient(() =>
        this.getClient().interactions.create({
          model: env.GEMINI_MODEL,
          system_instruction: systemInstruction,
          input: prompt,
          response_format: {
            type: 'text',
            mime_type: 'application/json',
            schema: toJsonSchema(schema),
          },
          ...(temperature !== undefined && { generation_config: { temperature } }),
        }),
      )
    } catch (error) {
      if (isAbortError(error)) throw error
      throw new AiUnavailableError()
    }

    const text = interaction.output_text
    if (!text) throw new Error('A IA não retornou uma resposta válida.')

    return schema.parse(JSON.parse(text))
  }
}
