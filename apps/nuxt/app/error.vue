<script setup lang="ts">
import type { NuxtError } from '#app'
import { clearError, clearNuxtData } from '#imports'
import { paths } from '~/lib/constants/paths'

const props = defineProps<{ error: NuxtError }>()

console.error(props.error)

const isNotFound = props.error.statusCode === 404
const title = isNotFound ? 'Página não encontrada' : 'Erro ao carregar'
const retryLabel = isNotFound ? 'Voltar ao início' : 'Tentar novamente'
const message = import.meta.dev ? props.error.message : undefined

async function handleRetry() {
  if (isNotFound) {
    await clearError({ redirect: paths.HOME })
    return
  }

  await clearNuxtData()
  await clearError()
}
</script>

<template>
  <UApp>
    <div class="mx-auto max-w-3xl px-4 py-6">
      <ErrorState
        :title="title"
        :message="message"
        :retry-label="retryLabel"
        retry
        @retry="handleRetry"
      />
    </div>
  </UApp>
</template>
