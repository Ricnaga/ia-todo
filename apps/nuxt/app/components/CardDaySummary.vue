<script setup lang="ts">
import { computed } from 'vue'
import { useNotifications } from '~/lib/utils/notifications'
import { useDaySummaryQuery } from '~/services/insights/insights.query'

const { notifyError } = useNotifications()
const { data: summary, status, error, execute } = useDaySummaryQuery()

const isPending = computed(() => status.value === 'pending')

async function handleGenerate() {
  await execute()
  if (error.value) notifyError('Não consegui gerar o resumo')(error.value)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-end">
      <UButton icon="i-tabler:sparkles" :loading="isPending" @click="handleGenerate">
        {{ summary ? 'Gerar novo resumo' : 'Gerar resumo' }}
      </UButton>
    </div>

    <p v-if="error" class="text-error text-sm">
      Não foi possível gerar o resumo agora. Verifique a configuração da IA e tente novamente.
    </p>

    <CardDaySummaryContent :summary="summary" :is-pending="isPending" />

    <EmptyState
      v-if="!summary && !isPending"
      message="Gere um resumo para ver o plano de execução do dia."
    />
  </div>
</template>
