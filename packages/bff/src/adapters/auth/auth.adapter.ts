import type { AuthController } from '@ia-task-manager/server'
import type { AuthPort } from './auth.port'

export function authAdapter(controller: AuthController): AuthPort {
  return {
    me: (headers) => controller.getProfile(headers),
    updateProfile: (headers, input) => controller.updateProfile(headers, input),
    changeEmail: (headers, input) => controller.changeEmail(headers, input),
    changePassword: (headers, input) => controller.changePassword(headers, input),
    listAccounts: (headers) => controller.listAccounts(headers),
    unlinkAccount: (headers, input) => controller.unlinkAccount(headers, input),
    listSessions: (headers) => controller.listSessions(headers),
    revokeSession: (headers, input) => controller.revokeSession(headers, input),
    revokeOtherSessions: (headers) => controller.revokeOtherSessions(headers),
  }
}
