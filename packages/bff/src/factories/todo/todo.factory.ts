import { todoController } from '@ia-task-manager/server/containers'
import { todoAdapter } from '../../adapters/base.adapters'

export function createTodoAdapter() {
  return todoAdapter(todoController)
}
