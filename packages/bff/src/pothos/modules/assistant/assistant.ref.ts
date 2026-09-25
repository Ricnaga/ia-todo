import type { Assistant, Criteria } from '@ia-task-manager/schemas/assistant'
import { builder } from '../../builder'
import { SearchStatusEnum, SearchPriorityEnum, SearchDueEnum } from './assistant.enums'
import { TodoRef } from '../todo'

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
