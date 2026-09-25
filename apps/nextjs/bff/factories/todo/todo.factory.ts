import { todoController } from '@/server/shared/container'
import { todoAdapter } from '@/bff/adapters/base.adapters'

export function createTodoAdapter() {
  return todoAdapter(todoController)
}
