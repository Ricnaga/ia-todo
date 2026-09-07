import { SchemaType, type Schema } from '@google/generative-ai'
import { getGeminiModel } from '@/server/modules/ai/client'
import { daySummarySchema, type DaySummary } from '@/lib/schemas/ai'
import type { Todo } from '@/lib/shared/todos/todo.types'

const SYSTEM_INSTRUCTION = `Você é um assistente de produtividade embutido em um app de tarefas (todo).
Seu trabalho é analisar as tarefas pendentes do usuário e gerar um resumo útil do dia.
Regras:
- Responda APENAS com JSON válido, sem markdown, sem comentários.
- summary: resumo objetivo da situação (1 a 3 frases), citando o que está pendente.
- focus: a tarefa mais importante para começar, e por quê (1 frase).
- suggestedOrder: ordene os TÍTULOS das tarefas por prioridade e urgência sugerida.
- Não invente tarefas que não existam na lista fornecida.`

const responseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    summary: { type: SchemaType.STRING },
    focus: { type: SchemaType.STRING },
    suggestedOrder: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
  required: ['summary', 'focus', 'suggestedOrder'],
}

export async function summarizeDay(todos: Todo[]): Promise<DaySummary> {
  const payload = todos.map((todo) => ({
    title: todo.title,
    description: todo.description,
    priority: todo.priority,
    dueDate: todo.dueDate?.toISOString() ?? null,
    subtasks: todo.subtasks?.map((subtask) => subtask.title) ?? [],
  }))

  const result = await getGeminiModel().generateContent({
    systemInstruction: SYSTEM_INSTRUCTION,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Tarefas pendentes do usuário:\n${JSON.stringify(payload, null, 2)}`,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema,
      temperature: 0.5,
    },
  })

  const text = result.response.text()
  return daySummarySchema.parse(JSON.parse(text))
}
