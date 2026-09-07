import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai'
import { env } from '@/server/config/environment'

let cachedModel: GenerativeModel | null = null

export function getGeminiModel(): GenerativeModel {
  if (!env.GEMINI_API_KEY) {
    throw new Error(
      'GEMINI_API_KEY não configurada. Defina a variável no arquivo .env para usar os recursos de IA.',
    )
  }

  if (!cachedModel) {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
    cachedModel = genAI.getGenerativeModel({
      model: env.GEMINI_MODEL,
    })
  }

  return cachedModel
}
