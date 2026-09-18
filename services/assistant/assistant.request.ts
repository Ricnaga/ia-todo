import { request } from '@/services/graphql/base'
import { TODO_FIELDS } from '@/services/graphql/fragments'
import { todoSchema } from '@/lib/schemas/todo'
import type { SearchCriteria } from '@/lib/schemas/assistant'
import type { SearchResult } from '@/lib/shared/assistant/search'

type SearchResultWire = {
  criteria: SearchCriteria
  results: unknown[]
}

export async function nlSearch(query: string): Promise<SearchResult> {
  const data = await request<{ nlSearch: SearchResultWire }>(
    `
      mutation NlSearch($query: String!) {
        nlSearch(query: $query) {
          criteria {
            query
            keywords
            status
            priority
            due
          }
          results {
            ${TODO_FIELDS}
          }
        }
      }
    `,
    { query },
  )
  return {
    criteria: data.nlSearch.criteria,
    results: data.nlSearch.results.map((raw) => todoSchema.parse(raw)),
  }
}
