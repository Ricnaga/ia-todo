<script setup lang="ts">
import { useSeoMeta } from '#imports'
import { computed } from 'vue'
import { useMeQuery } from '~/services/auth/auth.query'

useSeoMeta({ title: 'Dashboard | ia-task-manager' })

const { data: user } = await useMeQuery()

const firstName = computed(() => user.value?.name.trim().split(' ')[0] ?? '')
</script>

<template>
  <div class="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6">
    <h1 class="text-highlighted text-3xl/tight font-bold">
      {{ firstName ? `Olá, ${firstName}!` : 'Dashboard' }}
    </h1>
    <UCard>
      <p class="text-dimmed">
        Em construção: as páginas de tarefas, resumo, busca e configurações chegam em seguida.
      </p>
    </UCard>
  </div>
</template>
