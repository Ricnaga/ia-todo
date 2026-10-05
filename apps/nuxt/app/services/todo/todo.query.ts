import { useAsyncData, useRequestHeaders } from '#imports'
import { listTodos, getTodo } from './todo.request'
import { todoQueryKeys } from './todo.keys'

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
