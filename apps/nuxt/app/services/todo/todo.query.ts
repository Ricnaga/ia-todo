import { useAsyncData, useRequestHeaders } from '#imports'
import { listTodos, getTodo } from './todo.request'
import { todoQueryKeys } from './todo.keys'

/**
 * O GraphQL `todos` nao aceita argumento nenhum (ver `pothos/modules/todo/todo.queries.ts`):
 * a listagem vem inteira e o filtro e do client, pela URL. Nao ha `filters` na
 * key porque uma key diferente para a mesma resposta duplicaria cache e request.
 */
export function useTodosQuery() {
  const requestHeaders = useRequestHeaders(['cookie'])
  return useAsyncData(todoQueryKeys.all, () => listTodos(requestHeaders), {
    server: true,
  })
}

export function useTodoQuery(id: string) {
  const requestHeaders = useRequestHeaders(['cookie'])
  return useAsyncData(todoQueryKeys.detail(id), () => getTodo(id, requestHeaders), {
    server: true,
  })
}
