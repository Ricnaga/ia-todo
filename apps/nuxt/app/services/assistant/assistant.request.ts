import { NlSearchDocument } from '@ia-task-manager/bff/graphql'
import { request } from '~/services/graphql/base'
import { assistantSchema, type Assistant } from '@ia-task-manager/schemas/assistant'

export async function nlSearch(query: string): Promise<Assistant> {
  const data = await request({ document: NlSearchDocument, variables: { query } })
  return assistantSchema.parse(data.nlSearch)
}
