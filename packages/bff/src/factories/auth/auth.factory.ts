import { authController } from '@ia-task-manager/server/containers'
import { authAdapter } from '../../adapters/base.adapters'

export function createAuthAdapter() {
  return authAdapter(authController)
}
