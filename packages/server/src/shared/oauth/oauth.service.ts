import { env } from '../../config/environment'
import type { AuthProvider, IOAuthService } from './oauth.interface'

export class OAuthService implements IOAuthService {
  getProviders(): AuthProvider[] {
    const providers: AuthProvider[] = []
    if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) providers.push('google')
    if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) providers.push('github')
    return providers
  }
}
