import { daySummarySchema, type DaySummary } from '@/lib/schemas/ai'
import type { Todo } from '@/lib/shared/todos/todo.types'
import type { AiService } from '@/server/shared/ai/ai.service.interface'

const SYSTEM_INSTRUCTION = `Você é um assistente de produtividade embutido em um app de tarefas (todo).
Seu trabalho é analisar as tarefas pendentes do usuário e gerar um resumo útil do dia.
Regras:
- Responda APENAS com JSON válido, sem markdown, sem comentários.
- summary: resumo objetivo da situação (1 a 3 frases), citando o que está pendente.
- focus: a tarefa mais importante para começar, e por quê (1 frase).
- suggestedOrder: ordene os TÍTULOS das tarefas por prioridade e urgência sugerida.
- Não invente tarefas que não existam na lista fornecida.`

export class SummarizeDayUseCase {
  constructor(private readonly aiService: AiService) {}

  async execute(todos: Todo[]): Promise<DaySummary> {
    const pending = todos.filter((todo) => !todo.completed)
    const payload = pending.map((todo) => ({
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      dueDate: todo.dueDate?.toISOString() ?? null,
      subtasks: todo.subtasks?.map((subtask) => subtask.title) ?? [],
    }))

    return this.aiService.generateStructured({
      systemInstruction: SYSTEM_INSTRUCTION,
      prompt: `Tarefas pendentes do usuário:\n${JSON.stringify(payload, null, 2)}`,
      schema: daySummarySchema,
      temperature: 0.5,
    })
  }
}
