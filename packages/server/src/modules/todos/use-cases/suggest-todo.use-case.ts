import { draftInputSchema, type DraftInput } from '@ia-task-manager/schemas/todo'
import { todoSuggestionSchema, type TodoSuggestion } from '@ia-task-manager/schemas/todo'
import { SUGGEST_TODO_SYSTEM_INSTRUCTION } from '../constants/prompt.constants'
import type { AiService } from '../../../shared/ai/ai.service.interface'

export class SuggestTodoUseCase {
  constructor(private readonly aiService: AiService) {}

  async execute(draft: DraftInput): Promise<TodoSuggestion> {
    const input = draftInputSchema.parse(draft)

    return this.aiService.generateStructured({
      systemInstruction: SUGGEST_TODO_SYSTEM_INSTRUCTION,
      prompt: `Rascunho da tarefa:\n${JSON.stringify(input)}`,
      schema: todoSuggestionSchema,
      temperature: 0.7,
    })
  }
}
