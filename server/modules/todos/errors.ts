export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'DomainError'
  }
}

export class TodoNotFoundError extends DomainError {
  constructor(id: string) {
    super('TODO_NOT_FOUND', `Tarefa não encontrada: ${id}`)
    this.name = 'TodoNotFoundError'
  }
}
