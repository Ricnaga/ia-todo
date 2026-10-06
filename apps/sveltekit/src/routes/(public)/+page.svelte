<script lang="ts">
  import { IconClipboardList, IconSearch, IconSparkles, IconStack2 } from '@tabler/icons-svelte'
  import { resolve } from '$app/paths'
  import { paths } from '$lib/constants/paths'

  type Feature = {
    icon: typeof IconSparkles
    title: string
    description: string
  }

  const features: Feature[] = [
    {
      icon: IconClipboardList,
      title: 'Tarefas',
      description:
        'CRUD completo com tabela, filtros e persistência em SQLite via server routes do SvelteKit.',
    },
    {
      icon: IconSparkles,
      title: 'Resumo do dia',
      description:
        'A IA analisa suas tarefas pendentes e devolve um plano: foco sugerido e ordem de execução.',
    },
    {
      icon: IconSearch,
      title: 'Busca em linguagem natural',
      description:
        'Digite "consultas de amanhã de alta prioridade" e a IA transforma em filtros sobre seus dados.',
    },
  ]
</script>

<svelte:head>
  <title>ia-task-manager</title>
  <meta
    name="description"
    content="Gerenciador de tarefas com assistência de IA: sugestões, resumo diário e busca em linguagem natural."
  />
</svelte:head>

<div class="mx-auto flex max-w-5xl flex-col gap-10 py-6">
  <div class="flex flex-col gap-4">
    <span class="badge preset-tonal-primary self-start">
      <IconStack2 size={14} />
      SvelteKit 5 · Svelte 5 · Prisma 7 · GraphQL · IA generativa
    </span>
    <h1 class="text-fg text-3xl/tight font-bold">
      Gerenciador de tarefas que muda o jogo: gestão de tarefas com IA
    </h1>
    <p class="text-muted max-w-2xl text-lg">
      Um produto real de todo list que usa IA no ciclo de vida da tarefa —<b> criar</b>,
      <b> planejar</b> e <b> encontrar</b>. Backend com uma única camada de negócio servida por uma
      única porta GraphQL (Yoga + Pothos) — usada pela UI e por consumidores externos.
    </p>
    <div class="flex gap-3">
      <a href={resolve(paths.REGISTER)} class="btn preset-filled-primary-500">
        <IconSparkles size={18} />
        Criar minha conta
      </a>
      <a href={resolve(paths.LOGIN)} class="btn preset-tonal">
        <IconClipboardList size={18} />
        Entrar
      </a>
    </div>
  </div>

  <div class="grid gap-4 sm:grid-cols-3">
    {#each features as feature (feature.title)}
      {@const Icon = feature.icon}
      <div class="card border-line bg-surface flex h-full flex-col border p-6">
        <div class="bg-accent-soft text-accent mb-3 inline-flex w-fit rounded-md p-3">
          <Icon size={22} />
        </div>
        <h3 class="text-fg mb-1.5 text-base font-semibold">{feature.title}</h3>
        <p class="text-muted text-sm">{feature.description}</p>
      </div>
    {/each}
  </div>

  <div class="grid gap-4 sm:grid-cols-2">
    <div class="card border-line bg-surface border p-6">
      <h4 class="text-fg mb-2 text-sm font-semibold">Arquitetura</h4>
      <pre class="text-muted m-0 overflow-x-auto font-mono text-sm">{`UI ──(fetch)──▶ GraphQL ─┐
Consumidor externo ──▶ GraphQL ─┤
                                ▼
          server/modules (controllers + use-cases + repositórios)
                                ▼
              SQLite (Prisma 7 + driver adapter)`}</pre>
    </div>
    <div class="card border-line bg-surface border p-6">
      <h4 class="text-fg mb-2 text-sm font-semibold">IA de ponta a ponta</h4>
      <p class="text-muted text-sm">
        Os recursos de IA atuam no ciclo de vida da tarefa e vivem no núcleo de negócio — assim UI e
        consumidores externos falam pela mesma porta GraphQL e a resposta é sempre consistente.
      </p>
    </div>
  </div>
</div>
