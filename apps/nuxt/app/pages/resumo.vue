<script setup lang="ts">
import { useSeoMeta } from '#imports'
import CardDaySummary from './resumo/_components/card-day-summary.vue'

definePageMeta({ layout: 'private' })

useSeoMeta({ title: 'Resumo do dia | ia-task-manager' })
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
    <div>
      <h1 class="text-highlighted text-3xl/tight font-bold">Resumo do dia</h1>
      <p class="text-dimmed text-sm">
        A IA lê suas tarefas pendentes e monta um plano de execução.
      </p>
    </div>

    <CardDaySummary />
  </div>
</template>
