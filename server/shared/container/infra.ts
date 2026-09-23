import { GeminiAiService } from '@/server/shared/ai/gemini'
import { OAuthService } from '@/server/shared/oauth/oauth.service'
import type { IOAuthService } from '@/server/shared/oauth/oauth.interface'

export const aiService = new GeminiAiService()

export const oauthService: IOAuthService = new OAuthService()
