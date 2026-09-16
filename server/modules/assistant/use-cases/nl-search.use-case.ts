import { searchCriteriaSchema, type SearchCriteria } from '@/lib/schemas/assistant'
import type { Todo } from '@/lib/schemas/todo'
import type { SearchResult } from '@/lib/shared/assistant/search'
import type { AiService } from '@/server/shared/ai/ai.service.interface'

const SYSTEM_INSTRUCTION = `Você interpreta buscas em linguagem natural dentro de um app de tarefas (todo).
Seu trabalho é transformar a consulta do usuário em critérios de filtro estruturados.
Regras:
- Responda APENAS com JSON válido, sem markdown, sem comentários.
- query: mantenha a consulta original do usuário.
- keywords: 1 a 5 termos-chave que devam aparecer no título ou descrição da tarefa.
- status: "pending" se quer tarefas a fazer, "completed" se concluídas, "any" se tanto faz.
- priority: prioridade explícita se citada ("urgente", "prioritário"), senão "any".
- due: "today" para hoje/vence hoje, "thisWeek" para esta semana, "overdue" para atrasadas/venceu, "none" para sem data, senão "any".`

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function matchesDue(todo: Todo, due: SearchCriteria['due']): boolean {
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

function matchesCriteria(todo: Todo, criteria: SearchCriteria): boolean {
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

  async execute(query: string, todos: Todo[]): Promise<SearchResult> {
    const criteria = await this.aiService.generateStructured({
      systemInstruction: SYSTEM_INSTRUCTION,
      prompt: `Consulta: "${query}"`,
      schema: searchCriteriaSchema,
      temperature: 0.2,
    })

    const results = todos.filter((todo) => matchesCriteria(todo, criteria))

    return { criteria, results }
  }
}
