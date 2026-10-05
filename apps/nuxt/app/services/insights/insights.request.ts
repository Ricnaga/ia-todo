import { SummarizeDayDocument } from '@ia-task-manager/bff/graphql'
import { request } from '~/services/graphql/base'
import { daySummarySchema, type DaySummary } from '@ia-task-manager/schemas/insights'

export async function summarizeDay(): Promise<DaySummary> {
  const data = await request({ document: SummarizeDayDocument })
  return daySummarySchema.parse(data.summarizeDay)
}
