import type { z } from 'zod'

export type AiGenerateOptions<T> = {
  systemInstruction: string
  prompt: string
  schema: z.ZodType<T>
  temperature?: number
}

export interface AiService {
  generateStructured<T>(options: AiGenerateOptions<T>): Promise<T>
}
