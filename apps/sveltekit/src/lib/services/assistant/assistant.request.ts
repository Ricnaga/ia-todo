import { NlSearchDocument } from '@ia-task-manager/bff/graphql'
import { request } from '$lib/services/graphql/base'
import type { GraphQLFetch } from '$lib/services/graphql/graphql.types'
import { assistantSchema, type Assistant } from '@ia-task-manager/schemas/assistant'

export async function nlSearch(query: string, graphqlFetch?: GraphQLFetch): Promise<Assistant> {
  const data = await request({ document: NlSearchDocument, variables: { query }, graphqlFetch })
  return assistantSchema.parse(data.nlSearch)
}
