import { authController } from '@/server/shared/container'
import { authAdapter } from '@/bff/adapters/base.adapters'

export function createAuthAdapter() {
  return authAdapter(authController)
}
