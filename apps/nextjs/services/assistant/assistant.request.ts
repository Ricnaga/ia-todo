import { request } from '@/services/graphql/base'
import { TODO_FIELDS } from '@/services/graphql/fragments'
import { assistantSchema, type Assistant } from '@ia-task-manager/schemas/assistant'

export async function nlSearch(query: string): Promise<Assistant> {
  const data = await request<{ nlSearch: unknown }>(
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
          todos {
            ${TODO_FIELDS}
          }
        }
      }
    `,
    { query },
  )
  return assistantSchema.parse(data.nlSearch)
}
