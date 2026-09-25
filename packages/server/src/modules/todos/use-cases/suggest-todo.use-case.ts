import { draftInputSchema, type DraftInput } from '@ia-task-manager/schemas/todo'
import { todoSuggestionSchema, type TodoSuggestion } from '@ia-task-manager/schemas/todo'
import type { AiService } from '../../../shared/ai/ai.service.interface'

const SYSTEM_INSTRUCTION = `Você é um assistente de produtividade embutido em um app de tarefas (todo).
Seu trabalho é pegar o rascunho de uma tarefa escrito pelo usuário e transformá-lo em uma sugestão completa e útil.
Regras:
- Responda APENAS com JSON válido, sem markdown, sem comentários.
- Se faltar contexto, faça suposições razoáveis e plausíveis no lugar.
- O título deve ser curto e acionável.
- A descrição deve ser objetiva (1 a 2 frases).
- As subtarefas devem ser etapas concretas e pequenas, de 2 a 5 itens.
- A prioridade deve refletir a urgência implícita no pedido do usuário.`

export class SuggestTodoUseCase {
  constructor(private readonly aiService: AiService) {}

  async execute(draft: DraftInput): Promise<TodoSuggestion> {
    const input = draftInputSchema.parse(draft)

    return this.aiService.generateStructured({
      systemInstruction: SYSTEM_INSTRUCTION,
      prompt: `Rascunho da tarefa:\n${JSON.stringify(input)}`,
      schema: todoSuggestionSchema,
      temperature: 0.7,
    })
  }
}
