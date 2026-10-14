import type { Subscription } from '@ia-task-manager/schemas/billing'
import { builder } from '../../builder'
import { DateTimeScalar } from '../../scalars'
import { BillingPlanEnum } from './billing.enums'

export const SubscriptionRef = builder.objectRef<Subscription>('Subscription')

SubscriptionRef.implement({
  fields: (t) => ({
    plan: t.expose('plan', { type: BillingPlanEnum }),
    status: t.exposeString('status', { nullable: true }),
    currentPeriodEnd: t.field({
      type: DateTimeScalar,
      nullable: true,
      resolve: (subscription) => subscription.currentPeriodEnd,
    }),
    cancelAtPeriodEnd: t.exposeBoolean('cancelAtPeriodEnd'),
  }),
})
