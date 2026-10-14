<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { navigateTo, refreshNuxtData, useRoute } from '#imports'
import type { BillingInterval, SubscriptionStatus } from '@ia-task-manager/schemas/billing'
import {
  FREE_FEATURES,
  PRO_FEATURES,
  PRO_INTERVAL_CAPTIONS,
  PRO_PRICES,
} from '~/lib/constants/billing.constants'
import { useNotifications } from '~/lib/utils/notifications'
import { billingQueryKeys } from '~/services/billing/billing.keys'
import {
  useCreateCheckoutSessionMutation,
  useCreatePortalSessionMutation,
} from '~/services/billing/billing.mutation'
import { useMySubscriptionQuery } from '~/services/billing/billing.query'
import PlanCard from '../plan-card/plan-card.vue'

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

const { notifyError, notifySuccess } = useNotifications()
const route = useRoute()
const { data: subscription } = await useMySubscriptionQuery()

const interval = ref<BillingInterval>('monthly')
const checkout = useCreateCheckoutSessionMutation()
const portal = useCreatePortalSessionMutation()

const isPro = computed(() => subscription.value?.plan === 'pro')
const statusLabel = computed(() =>
  subscription.value?.status ? STATUS_LABELS[subscription.value.status] : null,
)

onMounted(() => {
  if (route.query.checkout !== 'success') return

  notifySuccess('Pagamento confirmado', 'Estamos ativando sua assinatura Pro.')
  refreshNuxtData(billingQueryKeys.subscription)
  setTimeout(() => refreshNuxtData(billingQueryKeys.subscription), 2_000)
})

function handleSubscribe() {
  checkout.mutate(
    { interval: interval.value },
    {
      onSuccess: async (url) => {
        await navigateTo(url, { external: true })
      },
      onError: notifyError('Não foi possível iniciar a assinatura'),
    },
  )
}

function handleManage() {
  portal.mutate(undefined, {
    onSuccess: async (url) => {
      await navigateTo(url, { external: true })
    },
    onError: notifyError('Não foi possível abrir o gerenciamento da assinatura'),
  })
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="text-highlighted text-3xl/tight font-bold">Planos</h1>
      <p class="text-dimmed text-sm">
        {{
          isPro
            ? 'Você tem acesso a todos os recursos de IA.'
            : 'Assine o Pro para desbloquear os recursos de IA.'
        }}
      </p>
    </div>

    <p v-if="isPro && statusLabel" class="text-sm">
      Status: <span class="font-semibold">{{ statusLabel }}</span>
      <span v-if="subscription?.cancelAtPeriodEnd"> · encerra no fim do período atual</span>
    </p>

    <div class="grid gap-4 sm:grid-cols-2">
      <PlanCard
        title="Free"
        price="R$ 0"
        price-caption="para sempre"
        :features="FREE_FEATURES"
        :cta-label="isPro ? 'Incluído' : 'Seu plano atual'"
        cta-disabled
      />

      <PlanCard
        title="Pro"
        highlighted
        :price="PRO_PRICES[interval]"
        :price-caption="PRO_INTERVAL_CAPTIONS[interval]"
        :features="PRO_FEATURES"
        :badge="isPro ? 'Ativo' : 'Recomendado'"
        :cta-label="isPro ? 'Gerenciar assinatura' : 'Assinar o Pro'"
        :cta-loading="checkout.isPending.value || portal.isPending.value"
        @cta="isPro ? handleManage() : handleSubscribe()"
      >
        <div v-if="!isPro" class="border-line flex rounded-md border p-0.5">
          <button
            type="button"
            class="flex-1 rounded-sm px-3 py-1.5 text-sm font-medium"
            :class="interval === 'monthly' ? 'bg-accent text-on-accent' : 'text-dimmed'"
            @click="interval = 'monthly'"
          >
            Mensal
          </button>
          <button
            type="button"
            class="flex-1 rounded-sm px-3 py-1.5 text-sm font-medium"
            :class="interval === 'yearly' ? 'bg-accent text-on-accent' : 'text-dimmed'"
            @click="interval = 'yearly'"
          >
            Anual
          </button>
        </div>
      </PlanCard>
    </div>
  </div>
</template>
