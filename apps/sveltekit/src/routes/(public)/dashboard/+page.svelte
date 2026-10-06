<script lang="ts">
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()

  const firstName = $derived(data.user?.name.trim().split(' ')[0] ?? '')
</script>

<svelte:head>
  <title>Dashboard | ia-task-manager</title>
</svelte:head>

<div class="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6">
  <h1 class="text-fg text-3xl/tight font-bold">
    {firstName ? `Olá, ${firstName}!` : 'Dashboard'}
  </h1>
  <div class="card border-line bg-surface border p-6">
    <p class="text-muted">
      Em construção: as páginas de tarefas, resumo, busca e configurações chegam em seguida.
    </p>
  </div>
</div>
