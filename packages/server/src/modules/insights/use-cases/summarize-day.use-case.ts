import { daySummarySchema, type DaySummary } from '@ia-task-manager/schemas/insights'
import type { Todo } from '@ia-task-manager/schemas/todo'
import { SUMMARIZE_DAY_SYSTEM_INSTRUCTION } from '../constants/prompt.constants'
import { toPromptTodo } from '../mappers/todo-prompt.mapper'
import type { AiService } from '../../../shared/ai/ai.service.interface'

export class SummarizeDayUseCase {
  constructor(private readonly aiService: AiService) {}

  async execute(todos: Todo[]): Promise<DaySummary> {
    const payload = todos.filter((todo) => !todo.completed).map(toPromptTodo)

    return this.aiService.generateStructured({
      systemInstruction: SUMMARIZE_DAY_SYSTEM_INSTRUCTION,
      prompt: `Tarefas pendentes do usuário:\n${JSON.stringify(payload, null, 2)}`,
      schema: daySummarySchema,
      temperature: 0.5,
    })
  }
}
