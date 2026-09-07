export type TodoPriority = 'low' | 'medium' | 'high' | 'urgent'

export type TodoSubtask = {
  id: string
  title: string
  done: boolean
}

export type Todo = {
  id: string
  title: string
  description: string | null
  priority: TodoPriority
  dueDate: Date | null
  subtasks: TodoSubtask[] | null
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

export type TodoCreate = {
  title: string
  description?: string
  priority: TodoPriority
  dueDate?: Date | null
}

export type TodoUpdate = Partial<TodoCreate> & { completed?: boolean }
