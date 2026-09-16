import { ClientError, GraphQLClient } from 'graphql-request'
import { todoSchema, type Todo, type TodoPriority } from '@/lib/schemas/todo'
import type { DaySummary } from '@/lib/schemas/insights'
import type { DraftInput, TodoSuggestion } from '@/lib/schemas/todo'
import type { SearchCriteria } from '@/lib/schemas/assistant'
import type { SearchResult } from '@/lib/shared/assistant/search'

const client = new GraphQLClient('/api/graphql')

type SearchResultWire = {
  criteria: SearchCriteria
  results: unknown[]
}

function toTodo(raw: unknown): Todo {
  return todoSchema.parse(raw)
}

function toSearchResult(result: SearchResultWire): SearchResult {
  return {
    criteria: result.criteria,
    results: result.results.map(toTodo),
  }
}

async function request<T>(document: string, variables?: Record<string, unknown>): Promise<T> {
  try {
    return await client.request<T>(document, variables)
  } catch (error) {
    if (error instanceof ClientError) {
      throw new Error(error.response.errors?.[0]?.message ?? error.message)
    }
    throw error
  }
}

const TODO_FIELDS = `
  id
  title
  description
  priority
  dueDate
  completed
  createdAt
  updatedAt
  subtasks { id title done }
`

export type TodoCreateRequest = {
  title: string
  description?: string | null
  priority?: TodoPriority
  dueDate?: string | null
}

export type TodoUpdateRequest = Partial<TodoCreateRequest> & { completed?: boolean }

export async function listTodos(): Promise<Todo[]> {
  const data = await request<{ todos: unknown[] }>(`
    query ListTodos {
      todos {
        ${TODO_FIELDS}
      }
    }
  `)
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

export async function summarizeDay(): Promise<DaySummary> {
  const data = await request<{ summarizeDay: DaySummary }>(
    `
      mutation SummarizeDay {
        summarizeDay {
          summary
          focus
          suggestedOrder
        }
      }
    `,
  )
  return data.summarizeDay
}

export async function nlSearch(query: string): Promise<SearchResult> {
  const data = await request<{ nlSearch: SearchResultWire }>(
    `
      mutation NlSearch($query: String!) {
        nlSearch(query: $query) {
          criteria {
            query
            keywords
            status
            priority
            due
          }
          results {
            ${TODO_FIELDS}
          }
        }
      }
    `,
    { query },
  )
  return toSearchResult(data.nlSearch)
}
