import { criteriaSchema, type Assistant, type Criteria } from '@ia-task-manager/schemas/assistant'
import type { Todo } from '@ia-task-manager/schemas/todo'
import { NL_SEARCH_SYSTEM_INSTRUCTION } from '../constants/prompt.constants'
import type { AiService } from '../../../shared/ai/ai.service.interface'

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function matchesDue(todo: Todo, due: Criteria['due']): boolean {
  if (due === 'any') return true
  if (due === 'none') return todo.dueDate === null

  if (!todo.dueDate) return false
  const dueDate = todo.dueDate

  if (due === 'overdue') {
    return dueDate.getTime() < startOfDay(new Date()).getTime()
  }

  if (due === 'today') {
    const start = startOfDay(new Date())
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    return dueDate >= start && dueDate < end
  }

  const start = startOfDay(new Date())
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  return dueDate >= start && dueDate <= end
}

function matchesCriteria(todo: Todo, criteria: Criteria): boolean {
  const text = `${todo.title} ${todo.description ?? ''}`.toLowerCase()
  const keywords = criteria.keywords.map((keyword) => keyword.toLowerCase())
  if (keywords.some((keyword) => !text.includes(keyword))) return false

  if (criteria.status === 'pending' && todo.completed) return false
  if (criteria.status === 'completed' && !todo.completed) return false

  if (criteria.priority !== 'any' && todo.priority !== criteria.priority) return false

  return matchesDue(todo, criteria.due)
}

export class NlSearchUseCase {
  constructor(private readonly aiService: AiService) {}

  async execute(query: string, todos: Todo[]): Promise<Assistant> {
    const criteria = await this.aiService.generateStructured({
      systemInstruction: NL_SEARCH_SYSTEM_INSTRUCTION,
      prompt: `Consulta: "${query}"`,
      schema: criteriaSchema,
      temperature: 0.2,
    })

    const matchingTodos = todos.filter((todo) => matchesCriteria(todo, criteria))

    return { criteria, todos: matchingTodos }
  }
}
