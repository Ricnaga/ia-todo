import { useQuery } from '@tanstack/react-query'
import { listTodos } from '@/lib/graphql/client'
import { todoQueryKeys } from './todo.keys'

export function useTodos() {
  return useQuery({
    queryKey: todoQueryKeys.all,
    queryFn: listTodos,
  })
}
