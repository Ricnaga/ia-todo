import { builder } from '../../builder'

export const BillingIntervalEnum = builder.enumType('BillingInterval', {
  values: ['monthly', 'yearly'],
})

export const BillingPlanEnum = builder.enumType('BillingPlan', {
  values: ['free', 'pro'],
})
