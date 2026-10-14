import { daySummarySchema, type DaySummary } from '@ia-task-manager/schemas/insights'
import type { Todo } from '@ia-task-manager/schemas/todo'
import { buildSummarizeDaySystemInstruction } from '../constants/prompt.constants'
import { toPromptTodo } from '../mappers/todo-prompt.mapper'
import { ProRequiredError } from '../../../shared/errors/app.errors'
import type { AiService } from '../../../shared/ai/ai.service.interface'
import type { EntitlementsService } from '../../../shared/entitlements/entitlements.interface'

const EMPTY_DAY_SUMMARY: DaySummary = {
  summary: 'Você não tem tarefas pendentes.',
  focus: 'Crie uma nova tarefa para começar.',
  tasks: [],
}

export class SummarizeDayUseCase {
  constructor(
    private readonly aiService: AiService,
    private readonly entitlements: EntitlementsService,
  ) {}

  async execute(todos: Todo[], userId: string): Promise<DaySummary> {
    if (!(await this.entitlements.hasAiAccess(userId))) throw new ProRequiredError()

    const payload = todos.filter((todo) => !todo.completed).map(toPromptTodo)

    if (payload.length === 0) {
      return EMPTY_DAY_SUMMARY
    }

    const today = new Date().toISOString().slice(0, 10)

    return this.aiService.generateStructured({
      systemInstruction: buildSummarizeDaySystemInstruction(today),
      prompt: `Tarefas pendentes do usuário:\n${JSON.stringify(payload, null, 2)}`,
      schema: daySummarySchema,
      temperature: 0.5,
    })
  }
}
