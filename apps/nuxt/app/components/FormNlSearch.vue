<script setup lang="ts">
import { ref } from 'vue'
import { useNotifications } from '~/lib/utils/notifications'
import { useNlSearchMutation } from '~/services/assistant/assistant.mutation'

const { notifyError } = useNotifications()
const { mutate, isPending, data: result } = useNlSearchMutation()

const query = ref('')

function handleSearch() {
  if (!query.value.trim()) return
  mutate(query.value, { onError: notifyError('Não consegui buscar') })
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') handleSearch()
}
</script>

<template>
  <div class="flex max-w-4xl flex-col gap-4">
    <div>
      <h1 class="text-highlighted text-3xl/tight font-bold">Busca em linguagem natural</h1>
      <p class="text-dimmed text-sm">
        Descreva o que procura em texto livre — a IA converte em filtros e aplica sobre suas
        tarefas.
      </p>
    </div>

    <div class="flex items-center gap-3">
      <UInput
        v-model="query"
        class="flex-1"
        placeholder="Ex.: consultas de amanhã de alta prioridade"
        @keydown.enter="handleKeydown"
      >
        <template #trailing>
          <UKbd>↵</UKbd>
        </template>
      </UInput>

      <UButton
        icon="i-tabler:search"
        :loading="isPending"
        :disabled="!query.trim()"
        @click="handleSearch"
      >
        Buscar
      </UButton>
    </div>

    <CardSearchResultList :result="result" :is-pending="isPending" />
  </div>
</template>
