import { GeminiAiService } from '../ai/gemini'
import { OAuthService } from '../oauth/oauth.service'
import type { IOAuthService } from '../oauth/oauth.interface'

export const aiService = new GeminiAiService()

export const oauthService: IOAuthService = new OAuthService()
