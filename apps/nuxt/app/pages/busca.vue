<script setup lang="ts">
import { useSeoMeta } from '#imports'

definePageMeta({ layout: 'private' })

useSeoMeta({ title: 'Busca por IA | ia-task-manager' })
</script>

<template>
  <div class="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6">
    <h1 class="text-highlighted text-3xl/tight font-bold">Busca por IA</h1>
    <UCard>
      <p class="text-dimmed">Em construção: a busca em linguagem natural chega na próxima fase.</p>
    </UCard>
  </div>
</template>
