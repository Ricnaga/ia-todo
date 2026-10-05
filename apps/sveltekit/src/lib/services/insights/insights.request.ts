import { SummarizeDayDocument } from '@ia-task-manager/bff/graphql'
import { request } from '$lib/services/graphql/base'
import type { GraphQLFetch } from '$lib/services/graphql/graphql.types'
import { daySummarySchema, type DaySummary } from '@ia-task-manager/schemas/insights'

export async function summarizeDay(graphqlFetch?: GraphQLFetch): Promise<DaySummary> {
  const data = await request({ document: SummarizeDayDocument, graphqlFetch })
  return daySummarySchema.parse(data.summarizeDay)
}
