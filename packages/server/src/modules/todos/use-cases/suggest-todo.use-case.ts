import { draftInputSchema, type DraftInput } from '@ia-task-manager/schemas/todo'
import { todoSuggestionSchema, type TodoSuggestion } from '@ia-task-manager/schemas/todo'
import { SUGGEST_TODO_SYSTEM_INSTRUCTION } from '../constants/prompt.constants'
import { ProRequiredError } from '../../../shared/errors/app.errors'
import type { AiService } from '../../../shared/ai/ai.service.interface'
import type { EntitlementsService } from '../../../shared/entitlements/entitlements.interface'

export class SuggestTodoUseCase {
  constructor(
    private readonly aiService: AiService,
    private readonly entitlements: EntitlementsService,
  ) {}

  async execute(draft: DraftInput, userId: string): Promise<TodoSuggestion> {
    if (!(await this.entitlements.hasAiAccess(userId))) throw new ProRequiredError()

    const input = draftInputSchema.parse(draft)

    return this.aiService.generateStructured({
      systemInstruction: SUGGEST_TODO_SYSTEM_INSTRUCTION,
      prompt: `Rascunho da tarefa:\n${JSON.stringify(input)}`,
      schema: todoSuggestionSchema,
      temperature: 0.7,
    })
  }
}
