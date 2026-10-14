'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { SegmentedControl, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import type { BillingInterval, SubscriptionStatus } from '@ia-task-manager/schemas/billing'
import { billingQueryKeys } from '@/services/billing/billing.keys'
import {
  useCreateCheckoutSessionMutation,
  useCreatePortalSessionMutation,
} from '@/services/billing/billing.mutation'
import { useMySubscriptionQuery } from '@/services/billing/billing.query'
import {
  FREE_FEATURES,
  PRO_FEATURES,
  PRO_INTERVAL_CAPTIONS,
  PRO_PRICES,
} from '@/lib/constants/billing.constants'
import { notifyError, notifySuccess } from '@/lib/utils/notifications'
import { PlanCard } from '../plan-card/plan-card'

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: 'Assinatura ativa',
  trialing: 'Período de teste',
  past_due: 'Pagamento pendente',
  canceled: 'Assinatura cancelada',
  incomplete: 'Assinatura incompleta',
  incomplete_expired: 'Assinatura expirada',
  unpaid: 'Pagamento em aberto',
  paused: 'Assinatura pausada',
}

export function PlanManager() {
  const { data: subscription } = useMySubscriptionQuery()
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const [interval, setInterval] = useState<BillingInterval>('monthly')

  const checkout = useCreateCheckoutSessionMutation()
  const portal = useCreatePortalSessionMutation()

  const isPro = subscription.plan === 'pro'

  useEffect(() => {
    if (searchParams.get('checkout') !== 'success') return

    notifySuccess('Pagamento confirmado', 'Estamos ativando sua assinatura Pro.')
    const invalidate = () =>
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.subscription })
    invalidate()
    const timer = setTimeout(invalidate, 2_000)
    return () => clearTimeout(timer)
  }, [searchParams, queryClient])

  function redirectTo(url: string): void {
    window.location.href = url
  }

  function handleSubscribe(): void {
    checkout.mutate(
      { interval },
      {
        onSuccess: redirectTo,
        onError: notifyError('Não foi possível iniciar a assinatura'),
      },
    )
  }

  function handleManage(): void {
    portal.mutate(undefined, {
      onSuccess: redirectTo,
      onError: notifyError('Não foi possível abrir o gerenciamento da assinatura'),
    })
  }

  return (
    <Stack gap="lg">
      <div>
        <Title order={3}>Planos</Title>
        <Text size="sm" c="dimmed">
          {isPro
            ? 'Você tem acesso a todos os recursos de IA.'
            : 'Assine o Pro para desbloquear os recursos de IA.'}
        </Text>
      </div>

      {isPro && subscription.status && (
        <Text size="sm">
          Status:{' '}
          <Text span fw={600}>
            {STATUS_LABELS[subscription.status]}
          </Text>
          {subscription.cancelAtPeriodEnd && ' · encerra no fim do período atual'}
        </Text>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <PlanCard
          title="Free"
          price="R$ 0"
          priceCaption="para sempre"
          features={FREE_FEATURES}
          ctaLabel={isPro ? 'Incluído' : 'Seu plano atual'}
          ctaDisabled
        />
        <PlanCard
          title="Pro"
          price={PRO_PRICES[interval]}
          priceCaption={PRO_INTERVAL_CAPTIONS[interval]}
          features={PRO_FEATURES}
          highlighted
          badge={isPro ? 'Ativo' : 'Recomendado'}
          ctaLabel={isPro ? 'Gerenciar assinatura' : 'Assinar o Pro'}
          ctaLoading={checkout.isPending || portal.isPending}
          onCta={isPro ? handleManage : handleSubscribe}
        >
          {!isPro && (
            <SegmentedControl
              fullWidth
              value={interval}
              onChange={(value) => setInterval(value as BillingInterval)}
              data={[
                { label: 'Mensal', value: 'monthly' },
                { label: 'Anual', value: 'yearly' },
              ]}
            />
          )}
        </PlanCard>
      </SimpleGrid>
    </Stack>
  )
}
