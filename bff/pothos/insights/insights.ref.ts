import type { DaySummary } from '@/lib/schemas/insights'
import { builder } from '@/bff/pothos/builder'

export const DaySummaryRef = builder.objectRef<DaySummary>('DaySummary')

DaySummaryRef.implement({
  fields: (t) => ({
    summary: t.exposeString('summary'),
    focus: t.exposeString('focus'),
    suggestedOrder: t.exposeStringList('suggestedOrder'),
  }),
})
