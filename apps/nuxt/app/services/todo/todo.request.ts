import {
  CreateTodoDocument,
  DeleteTodoDocument,
  GetTodoDocument,
  ListTodosDocument,
  SuggestTodoDocument,
  UpdateTodoDocument,
} from '@ia-task-manager/bff/graphql'
import { request } from '~/services/graphql/base'
import type { RequestHeaders } from '~/services/graphql/graphql.types'
import type { TodoCreateRequest, TodoUpdateRequest } from './todo.types'
import {
  todoSchema,
  todoSuggestionSchema,
  type DraftInput,
  type Todo,
  type TodoSuggestion,
} from '@ia-task-manager/schemas/todo'

/**
 * Os dois genericos do `request` sao inferidos do documento gerado, entao o
 * `TResult` vem da operacao e o `TVariables` das variaveis dela -- sem `<T>`
 * escrito a mao. O tipo gerado descreve o *wire* (`createdAt` e `string`,
 * `priority` e a union do enum), e o zod continua normalizando para os tipos de
 * dominio (`Date`, `TodoPriority`). Os dois nao se substituem: o codegen segura
 * o contrato do schema, o zod valida o que veio de fato.
 */
export async function listTodos(headers?: RequestHeaders): Promise<Todo[]> {
  const data = await request({ document: ListTodosDocument, headers })
  return data.todos.map((todo) => todoSchema.parse(todo))
}

export async function getTodo(id: string, headers?: RequestHeaders): Promise<Todo> {
  const data = await request({ document: GetTodoDocument, variables: { id }, headers })
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
