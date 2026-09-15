import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai'
import { env } from '@/server/config/environment'
import { toGeminiSchema } from '@/server/shared/ai/gemini-schema.mapper'
import type { AiGenerateOptions, AiService } from '@/server/shared/ai/ai.service.interface'

export class GeminiAiService implements AiService {
  private model: GenerativeModel | null = null

  private getModel(): GenerativeModel {
    if (!env.GEMINI_API_KEY) {
      throw new Error(
        'GEMINI_API_KEY não configurada. Defina a variável no arquivo .env para usar os recursos de IA.',
      )
    }

    if (!this.model) {
      const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
      this.model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL })
    }

    return this.model
  }

  async generateStructured<T>({
    systemInstruction,
    prompt,
    schema,
    temperature,
  }: AiGenerateOptions<T>): Promise<T> {
    const result = await this.getModel().generateContent({
      systemInstruction,
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: toGeminiSchema(schema),
        ...(temperature !== undefined && { temperature }),
      },
    })

    const text = result.response.text()
    return schema.parse(JSON.parse(text))
  }
}
