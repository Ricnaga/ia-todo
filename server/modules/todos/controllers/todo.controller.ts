import type { ListTodosUseCase } from '@/server/modules/todos/use-cases/list-todos.use-case'
import type { FindTodoByIdUseCase } from '@/server/modules/todos/use-cases/find-todo-by-id.use-case'
import type { CreateTodoUseCase } from '@/server/modules/todos/use-cases/create-todo.use-case'
import type { UpdateTodoUseCase } from '@/server/modules/todos/use-cases/update-todo.use-case'
import type { DeleteTodoUseCase } from '@/server/modules/todos/use-cases/delete-todo.use-case'
import type { SuggestTodoUseCase } from '@/server/modules/todos/use-cases/suggest-todo.use-case'
import type { Todo } from '@/lib/schemas/todo'
import type { TodoSuggestion } from '@/lib/schemas/todo'

type TodoUseCases = {
  list: ListTodosUseCase
  findById: FindTodoByIdUseCase
  create: CreateTodoUseCase
  update: UpdateTodoUseCase
  delete: DeleteTodoUseCase
  suggestTodo: SuggestTodoUseCase
}

export class TodoController {
  constructor(private readonly useCases: TodoUseCases) {}

  list(): Promise<Todo[]> {
    return this.useCases.list.execute()
  }

  getById(id: string): Promise<Todo> {
    return this.useCases.findById.execute(id)
  }

  create(raw: unknown): Promise<Todo> {
    return this.useCases.create.execute(raw)
  }

  update(id: string, raw: unknown): Promise<Todo> {
    return this.useCases.update.execute(id, raw)
  }

  delete(id: string): Promise<void> {
    return this.useCases.delete.execute(id)
  }

  suggestTodo(raw: unknown): Promise<TodoSuggestion> {
    return this.useCases.suggestTodo.execute(raw)
  }
}
