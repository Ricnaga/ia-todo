import { GraphQLRequestError } from '@ia-task-manager/bff/graphql'
import { todoQueryKeys } from '$lib/services/todo/todo.keys'
import { listTodos } from '$lib/services/todo/todo.request'
import type { Todo } from '@ia-task-manager/schemas/todo'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, depends }) => {
  depends(todoQueryKeys.all)

  try {
    const todos = await listTodos(fetch)
    return { todos, loadError: null } as { todos: Todo[]; loadError: string | null }
  } catch (cause) {
    console.error('[tarefas] failed to load todos', cause)
    const message =
      cause instanceof GraphQLRequestError
        ? cause.message
        : cause instanceof Error
          ? cause.message
          : 'Não foi possível carregar as tarefas.'
    return { todos: [], loadError: message } as { todos: Todo[]; loadError: string | null }
  }
}
