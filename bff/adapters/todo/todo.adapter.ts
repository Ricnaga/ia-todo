import type { TodoController } from '@/server/modules/todos/controllers/todo.controller'
import type { TodoPort } from './todo.port'

export function todoAdapter(controller: TodoController): TodoPort {
  return {
    list: (userId) => controller.list(userId),
    getById: (id, userId) => controller.getById(id, userId),
    create: (input, userId) => controller.create(input, userId),
    update: (id, input, userId) => controller.update(id, input, userId),
    delete: (id, userId) => controller.delete(id, userId),
    suggestTodo: (draft) => controller.suggestTodo(draft),
  }
}
