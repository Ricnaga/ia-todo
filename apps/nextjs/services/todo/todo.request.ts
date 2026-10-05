import { request } from '@/services/graphql/base'
import type { RequestHeaders } from '@/services/graphql/graphql.types'
import type { TodoCreateRequest, TodoUpdateRequest } from './todo.types'
import {
  CreateTodoDocument,
  DeleteTodoDocument,
  GetTodoDocument,
  ListTodosDocument,
  SuggestTodoDocument,
  UpdateTodoDocument,
} from '@ia-task-manager/bff/graphql'
import {
  todoSchema,
  todoSuggestionSchema,
  type Todo,
  type TodoSuggestion,
} from '@ia-task-manager/schemas/todo'
import type { DraftInput } from '@ia-task-manager/schemas/todo'

export async function listTodos(headers?: RequestHeaders): Promise<Todo[]> {
  const data = await request({ document: ListTodosDocument, headers })
  return data.todos.map((todo) => todoSchema.parse(todo))
}

export async function getTodo(id: string): Promise<Todo> {
  const data = await request({ document: GetTodoDocument, variables: { id } })
  return todoSchema.parse(data.todo)
}

export async function createTodo(input: TodoCreateRequest): Promise<Todo> {
  const data = await request({ document: CreateTodoDocument, variables: { input } })
  return todoSchema.parse(data.createTodo)
}

export async function updateTodo(id: string, input: TodoUpdateRequest): Promise<Todo> {
  const data = await request({ document: UpdateTodoDocument, variables: { id, input } })
  return todoSchema.parse(data.updateTodo)
}

export async function deleteTodo(id: string): Promise<boolean> {
  const data = await request({ document: DeleteTodoDocument, variables: { id } })
  return data.deleteTodo
}

export async function suggestTodo(draft: DraftInput): Promise<TodoSuggestion> {
  const data = await request({ document: SuggestTodoDocument, variables: { draft } })
  return todoSuggestionSchema.parse(data.suggestTodo)
}
