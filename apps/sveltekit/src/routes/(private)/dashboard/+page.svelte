<script lang="ts">
  import { resolve } from '$app/paths'
  import { IconClipboardList, IconSearch, IconSettings, IconSparkles } from '@tabler/icons-svelte'
  import { paths } from '$lib/constants/paths'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()

  const firstName = $derived(data.user.name.trim().split(' ')[0] ?? '')

  const shortcuts = [
    {
      to: paths.TAREFAS,
      icon: IconClipboardList,
      title: 'Tarefas',
      description: 'Gerencie suas tarefas com tabela, filtros e sugestão de IA.',
      cta: 'Abrir tarefas',
    },
    {
      to: paths.RESUMO,
      icon: IconSparkles,
      title: 'Resumo do dia',
      description: 'A IA organiza suas pendências em um plano de execução.',
      cta: 'Gerar resumo',
    },
    {
      to: paths.BUSCA,
      icon: IconSearch,
      title: 'Busca por IA',
      description: 'Pergunte em linguagem natural e a IA filtra seus dados.',
      cta: 'Fazer uma busca',
    },
  ]
</script>

<svelte:head>
  <title>Dashboard | ia-task-manager</title>
</svelte:head>

<div class="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-6">
  <div class="flex flex-col gap-2">
    <h1 class="text-highlighted text-3xl/tight font-bold">
      {firstName ? `Olá, ${firstName} 👋` : 'Dashboard'}
    </h1>
    <p class="text-dimmed text-lg">Sua central de produtividade com IA. Escolha onde começar.</p>
  </div>

  <div class="grid gap-4 sm:grid-cols-3">
    {#each shortcuts as { to, icon: Icon, title, description, cta } (to)}
      <a
        href={resolve(to)}
        class="card border-line bg-surface border transition-shadow hover:shadow-md focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none"
      >
        <div class="flex h-full flex-col gap-4 p-6">
          <span
            class="bg-accent-soft text-accent flex size-10 items-center justify-center rounded-lg"
          >
            <Icon class="size-5" />
          </span>
          <div class="flex flex-col gap-1.5">
            <p class="text-highlighted font-semibold">{title}</p>
            <p class="text-dimmed text-sm">{description}</p>
          </div>
          <span
            class="text-accent hover:bg-accent-soft mt-auto block w-full rounded-md px-3 py-1.5 text-center text-sm font-medium"
          >
            {cta}
          </span>
        </div>
      </a>
    {/each}
  </div>

  <div>
    <a href={resolve(paths.SETTINGS)} class="btn preset-tonal">
      <IconSettings />
      Gerenciar minha conta
    </a>
  </div>
</div>
