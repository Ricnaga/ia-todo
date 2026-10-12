import type { DaySummary } from '@ia-task-manager/schemas/insights'
import { builder } from '../../builder'

export const DaySummaryTaskRef = builder.objectRef<DaySummary['tasks'][number]>('DaySummaryTask')

DaySummaryTaskRef.implement({
  fields: (t) => ({
    title: t.exposeString('title'),
    note: t.exposeString('note'),
  }),
})

export const DaySummaryRef = builder.objectRef<DaySummary>('DaySummary')

DaySummaryRef.implement({
  fields: (t) => ({
    summary: t.exposeString('summary'),
    focus: t.exposeString('focus'),
    tasks: t.expose('tasks', { type: [DaySummaryTaskRef] }),
  }),
})
