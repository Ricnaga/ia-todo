<script setup lang="ts">
import { useSeoMeta } from '#imports'

definePageMeta({ layout: 'private' })

useSeoMeta({ title: 'Configurações | ia-task-manager' })
</script>

<template>
  <div class="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6">
    <h1 class="text-highlighted text-3xl/tight font-bold">Configurações</h1>
    <UCard>
      <p class="text-dimmed">Em construção: as preferências da conta chegam na última fase.</p>
    </UCard>
  </div>
</template>
