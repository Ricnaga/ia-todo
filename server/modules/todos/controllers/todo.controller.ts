import type { ITodoUseCase } from '@/server/modules/todos/use-cases/todo.use-case.interface'
import type { Todo } from '@/lib/schemas/todo'
import type { TodoSuggestion } from '@/lib/schemas/todo'
import type { CreateTodoInput, UpdateTodoInput, DraftInput } from '@/lib/schemas/todo'

export class TodoController {
  constructor(private readonly todoUseCase: ITodoUseCase) {}

  list(): Promise<Todo[]> {
    return this.todoUseCase.list()
  }

  getById(id: string): Promise<Todo> {
    return this.todoUseCase.getById(id)
  }

  create(input: CreateTodoInput): Promise<Todo> {
    return this.todoUseCase.create(input)
  }

  update(id: string, input: UpdateTodoInput): Promise<Todo> {
    return this.todoUseCase.update(id, input)
  }

  delete(id: string): Promise<void> {
    return this.todoUseCase.delete(id)
  }

  suggestTodo(draft: DraftInput): Promise<TodoSuggestion> {
    return this.todoUseCase.suggestTodo(draft)
  }
}
