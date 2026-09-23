import type { ITodoUseCase } from '@/server/modules/todos/use-cases/todo.use-case.interface'
import type { Todo } from '@/lib/schemas/todo'
import type { TodoSuggestion } from '@/lib/schemas/todo'
import type { CreateTodoInput, UpdateTodoInput, DraftInput } from '@/lib/schemas/todo'

export class TodoController {
  constructor(private readonly todoUseCase: ITodoUseCase) {}

  list(userId: string): Promise<Todo[]> {
    return this.todoUseCase.list(userId)
  }

  getById(id: string, userId: string): Promise<Todo> {
    return this.todoUseCase.getById(id, userId)
  }

  create(input: CreateTodoInput, userId: string): Promise<Todo> {
    return this.todoUseCase.create(input, userId)
  }

  update(id: string, input: UpdateTodoInput, userId: string): Promise<Todo> {
    return this.todoUseCase.update(id, input, userId)
  }

  delete(id: string, userId: string): Promise<void> {
    return this.todoUseCase.delete(id, userId)
  }

  suggestTodo(draft: DraftInput): Promise<TodoSuggestion> {
    return this.todoUseCase.suggestTodo(draft)
  }
}
