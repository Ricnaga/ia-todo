export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class TodoNotFoundError extends AppError {
  constructor(id: string) {
    super('TODO_NOT_FOUND', `Tarefa não encontrada: ${id}`)
    this.name = 'TodoNotFoundError'
  }
}

export class AuthenticationRequiredError extends AppError {
  constructor() {
    super('UNAUTHENTICATED', 'Você precisa estar autenticado para realizar esta operação')
    this.name = 'AuthenticationRequiredError'
  }
}

export class AuthActionFailedError extends AppError {
  constructor(message: string) {
    super('AUTH_ACTION_FAILED', message)
    this.name = 'AuthActionFailedError'
  }
}

export class AiUnavailableError extends AppError {
  constructor() {
    super(
      'AI_UNAVAILABLE',
      'A IA está temporariamente indisponível. Tente novamente em alguns instantes.',
    )
    this.name = 'AiUnavailableError'
  }
}

export class ProRequiredError extends AppError {
  constructor() {
    super('PRO_REQUIRED', 'Este recurso de IA é exclusivo do plano Pro.')
    this.name = 'ProRequiredError'
  }
}

export class StripeNotConfiguredError extends AppError {
  constructor() {
    super(
      'STRIPE_NOT_CONFIGURED',
      'O pagamento está indisponível no momento. Tente novamente mais tarde.',
    )
    this.name = 'StripeNotConfiguredError'
  }
}

export class SubscriptionNotFoundError extends AppError {
  constructor() {
    super('SUBSCRIPTION_NOT_FOUND', 'Nenhuma assinatura encontrada para gerenciar.')
    this.name = 'SubscriptionNotFoundError'
  }
}
