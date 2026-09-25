import { createTodoSchema, type CreateTodoInput } from '@ia-task-manager/schemas/todo'
import type { ITodoRepository } from '../repositories/todo-repository.interface'
import type { Todo } from '@ia-task-manager/schemas/todo'

export class CreateTodoUseCase {
  constructor(private readonly todoRepository: ITodoRepository) {}

  async execute(input: CreateTodoInput, userId: string): Promise<Todo> {
    return this.todoRepository.create(createTodoSchema.parse(input), userId)
  }
}
