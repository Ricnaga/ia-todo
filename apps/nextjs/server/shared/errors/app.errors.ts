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
