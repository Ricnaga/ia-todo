import { createTodoSchema, type CreateTodoInput } from '@/lib/schemas/todo'
import type { ITodoRepository } from '@/server/modules/todos/repositories/todo-repository.interface'
import type { Todo } from '@/lib/schemas/todo'

export class CreateTodoUseCase {
  constructor(private readonly todoRepository: ITodoRepository) {}

  async execute(input: CreateTodoInput): Promise<Todo> {
    return this.todoRepository.create(createTodoSchema.parse(input))
  }
}
