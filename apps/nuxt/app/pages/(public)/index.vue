<script setup lang="ts">
import { useSeoMeta } from '#imports'
import { paths } from '~/lib/constants/paths'

useSeoMeta({
  title: 'ia-task-manager',
  description:
    'Gerenciador de tarefas com assistência de IA: sugestões, resumo diário e busca em linguagem natural.',
})

type Feature = {
  icon: string
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: 'i-tabler:clipboard-list',
    title: 'Tarefas',
    description: 'CRUD completo com tabela, filtros e persistência em SQLite via server routes.',
  },
  {
    icon: 'i-tabler:sparkles',
    title: 'Resumo do dia',
    description:
      'A IA analisa suas tarefas pendentes e devolve um plano: foco sugerido e ordem de execução.',
  },
  {
    icon: 'i-tabler:search',
    title: 'Busca em linguagem natural',
    description:
      'Digite "consultas de amanhã de alta prioridade" e a IA transforma em filtros sobre seus dados.',
  },
]
</script>

<template>
  <div class="mx-auto flex max-w-5xl flex-col gap-10 py-6">
    <div class="flex flex-col gap-4">
      <UBadge size="lg" variant="soft" icon="i-tabler:stack-2" class="self-start">
        Nuxt 4 · Vue 3 · Prisma 7 · GraphQL · IA generativa
      </UBadge>
      <h1 class="text-highlighted text-3xl/tight font-bold">
        Gerenciador de tarefas que muda o jogo: gestão de tarefas com IA
      </h1>
      <p class="text-dimmed max-w-2xl text-lg">
        Um produto real de todo list que usa IA no ciclo de vida da tarefa —<b> criar</b>,
        <b> planejar</b> e <b> encontrar</b>. Backend com uma única camada de negócio servida por
        uma única porta GraphQL (Yoga + Pothos) — usada pela UI e por consumidores externos.
      </p>
      <div class="flex gap-3">
        <UButton :to="paths.REGISTER" size="lg" icon="i-tabler:sparkles">
          Criar minha conta
        </UButton>
        <UButton :to="paths.LOGIN" variant="soft" size="lg" icon="i-tabler:clipboard-list">
          Entrar
        </UButton>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <UCard v-for="feature in features" :key="feature.title">
        <div class="bg-primary/10 text-primary mb-3 inline-flex rounded-md p-3">
          <UIcon :name="feature.icon" class="size-6" />
        </div>
        <h3 class="text-highlighted mb-1.5 font-semibold">
          {{ feature.title }}
        </h3>
        <p class="text-dimmed mb-4 text-sm">
          {{ feature.description }}
        </p>
      </UCard>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <UCard>
        <h4 class="text-highlighted mb-2 text-sm font-semibold">Arquitetura</h4>
        <pre class="text-dimmed m-0 font-mono text-sm">{{
          `UI ──(useAsyncData)──▶ GraphQL ─┐
Consumidor externo ──▶ GraphQL ─┤
                                ▼
          server/modules (controllers + use-cases + repositórios)
                                ▼
              SQLite (Prisma 7 + driver adapter)`
        }}</pre>
      </UCard>
      <UCard>
        <h4 class="text-highlighted mb-2 text-sm font-semibold">IA de ponta a ponta</h4>
        <p class="text-dimmed text-sm">
          Os recursos de IA atuam no ciclo de vida da tarefa e vivem no núcleo de negócio — assim UI
          e consumidores externos falam pela mesma porta GraphQL e a resposta é sempre consistente.
        </p>
      </UCard>
    </div>
  </div>
</template>
