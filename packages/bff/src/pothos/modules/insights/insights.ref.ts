import type { DaySummary } from '@ia-task-manager/schemas/insights'
import { builder } from '../../builder'

export const DaySummaryRef = builder.objectRef<DaySummary>('DaySummary')

DaySummaryRef.implement({
  fields: (t) => ({
    summary: t.exposeString('summary'),
    focus: t.exposeString('focus'),
    suggestedOrder: t.exposeStringList('suggestedOrder'),
  }),
})
