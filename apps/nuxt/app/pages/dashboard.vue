<script setup lang="ts">
import { useSeoMeta } from '#imports'
import { computed } from 'vue'
import { paths } from '~/lib/constants/paths'
import { useMeQuery } from '~/services/auth/auth.query'

definePageMeta({ layout: 'private' })

useSeoMeta({ title: 'Dashboard | ia-task-manager' })

const { data: user } = await useMeQuery()

const firstName = computed(() => user.value?.name.trim().split(' ')[0] ?? '')

const shortcuts = [
  {
    to: paths.TAREFAS,
    icon: 'i-tabler:clipboard-list',
    title: 'Tarefas',
    description: 'Gerencie suas tarefas com tabela, filtros e sugestão de IA.',
    cta: 'Abrir tarefas',
  },
  {
    to: paths.RESUMO,
    icon: 'i-tabler:sparkles',
    title: 'Resumo do dia',
    description: 'A IA organiza suas pendências em um plano de execução.',
    cta: 'Gerar resumo',
  },
  {
    to: paths.BUSCA,
    icon: 'i-tabler:search',
    title: 'Busca por IA',
    description: 'Pergunte em linguagem natural e a IA filtra seus dados.',
    cta: 'Fazer uma busca',
  },
]
</script>

<template>
  <div class="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-6">
    <div class="flex flex-col gap-2">
      <h1 class="text-highlighted text-3xl/tight font-bold">
        {{ firstName ? `Olá, ${firstName} 👋` : 'Dashboard' }}
      </h1>
      <p class="text-dimmed text-lg">Sua central de produtividade com IA. Escolha onde começar.</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <NuxtLink
        v-for="shortcut in shortcuts"
        :key="shortcut.to"
        :to="shortcut.to"
        class="focus-visible:ring-ring transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:outline-none"
      >
        <UCard class="h-full">
          <div class="flex h-full flex-col gap-4">
            <span
              class="bg-accent-soft text-accent flex size-10 items-center justify-center rounded-lg"
            >
              <UIcon :name="shortcut.icon" class="size-5.5" />
            </span>
            <div class="flex flex-col gap-1.5">
              <p class="text-highlighted font-semibold">{{ shortcut.title }}</p>
              <p class="text-dimmed text-sm">{{ shortcut.description }}</p>
            </div>
            <span
              class="text-accent hover:bg-accent-soft mt-auto block w-full rounded-md px-3 py-1.5 text-center text-sm font-medium"
            >
              {{ shortcut.cta }}
            </span>
          </div>
        </UCard>
      </NuxtLink>
    </div>

    <div>
      <UButton :to="paths.SETTINGS" icon="i-tabler:settings" label="Gerenciar minha conta" />
    </div>
  </div>
</template>
