import type { TodoController } from '@/server/modules/todos/controllers/todo.controller'
import type { TodoPort } from './todo.port'

export function todoAdapter(controller: TodoController): TodoPort {
  return {
    list: () => controller.list(),
    getById: (id) => controller.getById(id),
    create: (input) => controller.create(input),
    update: (id, input) => controller.update(id, input),
    delete: (id) => controller.delete(id),
    suggestTodo: (draft) => controller.suggestTodo(draft),
  }
}
