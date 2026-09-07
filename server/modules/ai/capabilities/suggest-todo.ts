import { SchemaType, type Schema } from '@google/generative-ai'
import { getGeminiModel } from '@/server/modules/ai/client'
import { draftInputSchema, todoSuggestionSchema, type TodoSuggestion } from '@/lib/schemas/ai'

const SYSTEM_INSTRUCTION = `Você é um assistente de produtividade embutido em um app de tarefas (todo).
Seu trabalho é pegar o rascunho de uma tarefa escrito pelo usuário e transformá-lo em uma sugestão completa e útil.
Regras:
- Responda APENAS com JSON válido, sem markdown, sem comentários.
- Se faltar contexto, faça suposições razoáveis e plausíveis no lugar.
- O título deve ser curto e acionável.
- A descrição deve ser objetiva (1 a 2 frases).
- As subtarefas devem ser etapas concretas e pequenas, de 2 a 5 itens.
- A prioridade deve refletir a urgência implícita no pedido do usuário.`

const responseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    description: { type: SchemaType.STRING },
    priority: {
      type: SchemaType.STRING,
      format: 'enum',
      enum: ['low', 'medium', 'high', 'urgent'],
    },
    subtasks: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
  required: ['title', 'description', 'priority', 'subtasks'],
}

export async function suggestTodo(draft: unknown): Promise<TodoSuggestion> {
  const input = draftInputSchema.parse(draft)

  const result = await getGeminiModel().generateContent({
    systemInstruction: SYSTEM_INSTRUCTION,
    contents: [
      {
        role: 'user',
        parts: [{ text: `Rascunho da tarefa:\n${JSON.stringify(input)}` }],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema,
      temperature: 0.7,
    },
  })

  const text = result.response.text()
  return todoSuggestionSchema.parse(JSON.parse(text))
}
