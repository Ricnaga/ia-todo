<script lang="ts">
  import { onMount } from 'svelte'
  import { invalidate } from '$app/navigation'
  import { page } from '$app/state'
  import type {
    BillingInterval,
    Subscription,
    SubscriptionStatus,
  } from '@ia-task-manager/schemas/billing'
  import {
    FREE_FEATURES,
    PRO_FEATURES,
    PRO_INTERVAL_CAPTIONS,
    PRO_PRICES,
  } from '$lib/constants/billing.constants'
  import { billingQueryKeys } from '$lib/services/billing/billing.keys'
  import {
    useCreateCheckoutSessionMutation,
    useCreatePortalSessionMutation,
  } from '$lib/services/billing/billing.mutation'
  import { notifyError, notifySuccess } from '$lib/utils/notifications'
  import PlanCard from '../plan-card/plan-card.svelte'

  interface Props {
    subscription: Subscription
  }

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

  let { subscription }: Props = $props()

  let interval = $state<BillingInterval>('monthly')
  const checkout = useCreateCheckoutSessionMutation()
  const portal = useCreatePortalSessionMutation()

  const isPro = $derived(subscription.plan === 'pro')
  const statusLabel = $derived(subscription.status ? STATUS_LABELS[subscription.status] : null)
  const isCtaLoading = $derived(checkout.isPending || portal.isPending)

  onMount(() => {
    if (page.url.searchParams.get('checkout') !== 'success') return

    notifySuccess('Pagamento confirmado', 'Estamos ativando sua assinatura Pro.')
    void invalidate(billingQueryKeys.subscription)
    setTimeout(() => void invalidate(billingQueryKeys.subscription), 2_000)
  })

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
</script>

<div class="flex flex-col gap-6">
  <div>
    <h1 class="text-fg text-3xl/tight font-bold">Planos</h1>
    <p class="text-muted text-sm">
      {isPro
        ? 'Você tem acesso a todos os recursos de IA.'
        : 'Assine o Pro para desbloquear os recursos de IA.'}
    </p>
  </div>

  {#if isPro && statusLabel}
    <p class="text-sm">
      Status:
      <span class="font-semibold">{statusLabel}</span>
      {#if subscription.cancelAtPeriodEnd}
        · encerra no fim do período atual
      {/if}
    </p>
  {/if}

  <div class="grid gap-4 sm:grid-cols-2">
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
      highlighted
      price={PRO_PRICES[interval]}
      priceCaption={PRO_INTERVAL_CAPTIONS[interval]}
      features={PRO_FEATURES}
      badge={isPro ? 'Ativo' : 'Recomendado'}
      ctaLabel={isPro ? 'Gerenciar assinatura' : 'Assinar o Pro'}
      ctaLoading={isCtaLoading}
      oncta={isPro ? handleManage : handleSubscribe}
    >
      {#if !isPro}
        <div class="border-line flex rounded-md border p-0.5">
          <button
            type="button"
            class="flex-1 rounded-sm px-3 py-1.5 text-sm font-medium {interval === 'monthly'
              ? 'bg-accent text-on-accent'
              : 'text-muted'}"
            onclick={() => (interval = 'monthly')}
          >
            Mensal
          </button>
          <button
            type="button"
            class="flex-1 rounded-sm px-3 py-1.5 text-sm font-medium {interval === 'yearly'
              ? 'bg-accent text-on-accent'
              : 'text-muted'}"
            onclick={() => (interval = 'yearly')}
          >
            Anual
          </button>
        </div>
      {/if}
    </PlanCard>
  </div>
</div>
