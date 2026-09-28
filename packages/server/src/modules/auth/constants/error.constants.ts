export const AUTH_ERROR_MESSAGES = {
  INVALID_PASSWORD: 'Senha atual incorreta.',
  PROVIDER_NOT_FOUND: 'Este provedor de login não está configurado.',
  FAILED_TO_UNLINK_LAST_ACCOUNT: 'Não é possível desvincular a única conta.',
  ACCOUNT_NOT_FOUND: 'Conta não encontrada.',
  CREDENTIAL_ACCOUNT_NOT_FOUND: 'Conta de e-mail/senha não encontrada.',
} as const

export type AuthErrorCode = keyof typeof AUTH_ERROR_MESSAGES

export const GENERIC_ERROR_MESSAGE = 'Não foi possível concluir a operação. Tente novamente.'

export const SESSION_NOT_FOUND_MESSAGE = 'Sessão não encontrada.'
