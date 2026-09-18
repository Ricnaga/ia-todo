import { useQuery } from '@tanstack/react-query'
import { listTodos } from './todo.request'
import { todoQueryKeys } from './todo.keys'

export function useTodosQuery() {
  return useQuery({
    queryKey: todoQueryKeys.all,
    queryFn: listTodos,
  })
}
