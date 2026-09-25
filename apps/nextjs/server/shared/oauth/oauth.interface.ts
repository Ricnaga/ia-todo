export const authProviders = ['google', 'github'] as const

export type AuthProvider = (typeof authProviders)[number]

export interface IOAuthService {
  getProviders(): AuthProvider[]
}
