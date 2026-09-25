import { request } from '@/services/graphql/base'
import type { DaySummary } from '@ia-task-manager/schemas/insights'

export async function summarizeDay(): Promise<DaySummary> {
  const data = await request<{ summarizeDay: DaySummary }>(
    `
      mutation SummarizeDay {
        summarizeDay {
          summary
          focus
          suggestedOrder
        }
      }
    `,
  )
  return data.summarizeDay
}
