import { request } from '@/services/graphql/base'
import { TODO_FIELDS } from '@/services/graphql/fragments'
import {
  todoSchema,
  type Todo,
  type TodoPriority,
  type TodoSuggestion,
} from '@ia-task-manager/schemas/todo'
import type { DraftInput } from '@ia-task-manager/schemas/todo'

export type TodoCreateRequest = {
  title: string
  description?: string | null
  priority?: TodoPriority | null
  dueDate?: string | null
}

export type TodoUpdateRequest = Partial<TodoCreateRequest> & { completed?: boolean }

const toTodo = (raw: unknown): Todo => todoSchema.parse(raw)

export async function listTodos(requestHeaders?: Record<string, string>): Promise<Todo[]> {
  const data = await request<{ todos: unknown[] }>(
    `
      query ListTodos {
        todos {
          ${TODO_FIELDS}
        }
      }
    `,
    undefined,
    requestHeaders,
  )
  return data.todos.map(toTodo)
}

export async function getTodo(id: string): Promise<Todo> {
  const data = await request<{ todo: unknown }>(
    `
      query GetTodo($id: String!) {
        todo(id: $id) {
          ${TODO_FIELDS}
        }
      }
    `,
    { id },
  )
  return toTodo(data.todo)
}

export async function createTodo(input: TodoCreateRequest): Promise<Todo> {
  const data = await request<{ createTodo: unknown }>(
    `
      mutation CreateTodo($input: CreateTodoInput!) {
        createTodo(input: $input) {
          ${TODO_FIELDS}
        }
      }
    `,
    { input },
  )
  return toTodo(data.createTodo)
}

export async function updateTodo(id: string, input: TodoUpdateRequest): Promise<Todo> {
  const data = await request<{ updateTodo: unknown }>(
    `
      mutation UpdateTodo($id: String!, $input: UpdateTodoInput!) {
        updateTodo(id: $id, input: $input) {
          ${TODO_FIELDS}
        }
      }
    `,
    { id, input },
  )
  return toTodo(data.updateTodo)
}

export async function deleteTodo(id: string): Promise<void> {
  await request<{ deleteTodo: boolean }>(
    `
      mutation DeleteTodo($id: String!) {
        deleteTodo(id: $id)
      }
    `,
    { id },
  )
}

export async function suggestTodo(draft: DraftInput): Promise<TodoSuggestion> {
  const data = await request<{ suggestTodo: TodoSuggestion }>(
    `
      mutation SuggestTodo($draft: DraftInput!) {
        suggestTodo(draft: $draft) {
          title
          description
          priority
          subtasks
        }
      }
    `,
    { draft },
  )
  return data.suggestTodo
}
