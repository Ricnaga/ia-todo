import type { ITodoRepository } from '../repositories/todo-repository.interface'
import type { Todo } from '@ia-task-manager/schemas/todo'

export class ListTodosUseCase {
  constructor(private readonly todoRepository: ITodoRepository) {}

  async execute(userId: string): Promise<Todo[]> {
    return this.todoRepository.list(userId)
  }
}
