import type { SearchCriteria } from '@/lib/schemas/assistant'
import type { SearchResult } from '@/lib/shared/assistant/search'
import { builder } from '@/bff/pothos/builder'
import {
  SearchStatusEnum,
  SearchPriorityEnum,
  SearchDueEnum,
} from '@/bff/pothos/assistant/assistant.enums'
import { TodoRef } from '@/bff/pothos/todo'

export const SearchCriteriaRef = builder.objectRef<SearchCriteria>('SearchCriteria')

export const SearchResultRef = builder.objectRef<SearchResult>('SearchResult')

SearchCriteriaRef.implement({
  fields: (t) => ({
    query: t.exposeString('query'),
    keywords: t.exposeStringList('keywords'),
    status: t.expose('status', { type: SearchStatusEnum }),
    priority: t.expose('priority', { type: SearchPriorityEnum }),
    due: t.expose('due', { type: SearchDueEnum }),
  }),
})

SearchResultRef.implement({
  fields: (t) => ({
    criteria: t.expose('criteria', { type: SearchCriteriaRef }),
    results: t.expose('results', { type: [TodoRef] }),
  }),
})
