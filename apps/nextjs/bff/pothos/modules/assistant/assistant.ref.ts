import type { Assistant, Criteria } from '@/lib/schemas/assistant'
import { builder } from '@/bff/pothos/builder'
import {
  SearchStatusEnum,
  SearchPriorityEnum,
  SearchDueEnum,
} from '@/bff/pothos/modules/assistant/assistant.enums'
import { TodoRef } from '@/bff/pothos/modules/todo'

export const CriteriaRef = builder.objectRef<Criteria>('Criteria')

export const AssistantRef = builder.objectRef<Assistant>('Assistant')

CriteriaRef.implement({
  fields: (t) => ({
    query: t.exposeString('query'),
    keywords: t.exposeStringList('keywords'),
    status: t.expose('status', { type: SearchStatusEnum }),
    priority: t.expose('priority', { type: SearchPriorityEnum }),
    due: t.expose('due', { type: SearchDueEnum }),
  }),
})

AssistantRef.implement({
  fields: (t) => ({
    criteria: t.expose('criteria', { type: CriteriaRef }),
    todos: t.expose('todos', { type: [TodoRef] }),
  }),
})
