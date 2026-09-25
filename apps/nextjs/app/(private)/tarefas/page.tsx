import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { cookies } from 'next/headers'
import { todoQueryKeys } from '@/services/todo/todo.keys'
import { listTodos } from '@/services/todo/todo.request'
import { TableTodoManager } from './_components/table-todo-manager/table-todo-manager'

export default async function TarefasPage() {
  const cookieStore = await cookies()
  const requestHeaders = { cookie: cookieStore.toString() }

  const queryClient = new QueryClient()
  await queryClient
    .query({
      queryKey: todoQueryKeys.all,
      queryFn: () => listTodos(requestHeaders),
      staleTime: 5_000,
    })
    .catch(() => undefined)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TableTodoManager />
    </HydrationBoundary>
  )
}
