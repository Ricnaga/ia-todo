<script lang="ts">
  import CardDaySummary from './_components/card-day-summary.svelte'
</script>

<svelte:head>
  <title>Resumo do dia | ia-task-manager</title>
</svelte:head>

<div class="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
  <div>
    <h1 class="text-fg text-3xl/tight font-bold">Resumo do dia</h1>
    <p class="text-muted text-sm">A IA lê suas tarefas pendentes e monta um plano de execução.</p>
  </div>

  <CardDaySummary />
</div>
