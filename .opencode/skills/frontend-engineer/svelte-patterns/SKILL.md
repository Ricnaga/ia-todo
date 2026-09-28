---
name: svelte-patterns
description: Use when building OR reviewing Svelte 5 component code (runes), including state ($state, $state.raw, $derived, $derived.by, $props, $bindable, $effect, $inspect, $host), typed components, .svelte.ts modules, snippets, actions/bindings, transitions and testing. For SvelteKit specifics (load, form actions, hooks, $app/state, $env) use sveltekit-patterns. Trigger on keywords like "svelte", "svelte 5", "runes", "$state", "$derived", "$props", "$bindable", "$effect", "$inspect", "$state.raw", "snippet", "@render", "action", "bind:", "transition", "component", ".svelte.ts", "vitest", "svelte-testing".
metadata:
  audience: frontend-engineer, staff-engineer
  scope: svelte
  mode: implementation-review
---

# Svelte Patterns — Implementação e Revisão

Referência de padrões para **Svelte 5 (runes)** para **implementação** (frontend-engineer) e **revisão** (staff-engineer). Validado contra a documentação oficial do Svelte e práticas da comunidade (2026; Svelte 5 estável).

> Esta skill é uma referência de implementação e revisão, **não um conjunto de regras absolutas**. Use o bom senso contextual; quando um critério conflitar com o contexto real, documente a decisão.

> **SvelteKit (full-stack)** é coberto por `sveltekit-patterns`. Esta skill foca em Svelte puro: runes, componentes, composição e reatividade.

## 1. Objetivo

Definir padrões de desenvolvimento e revisão de componentes Svelte 5 com runes e TypeScript, garantindo código reativo previsível, legível e **fortemente tipado** — evitando que assistentes de IA gerem sintaxe morta do Svelte 4 (`writable()`, `export let`, `$:`, `<slot>`, `onMount` para fetch).

## 2. Agentes autorizados

| Agente              | Papel                                                                         |
| ------------------- | ----------------------------------------------------------------------------- |
| `frontend-engineer` | Consulta antes de implementar ou refatorar componentes/funcionalidades Svelte |
| `staff-engineer`    | Consulta durante revisões e auditorias de código Svelte                       |

> **Acesso**: por contexto (trigger no `description`) — não há bloqueio por permissão. A pasta em que a skill vive indica **ownership** (quem a mantém), não audience. Agent fora do domínio deve delegar ao dono.

## 3. Svelte 5 usa runes — não `let` reativo / `$:` legado

Todo código novo deve usar **runes** (`$state`, `$derived`, `$props`, `$effect`, `$bindable`, `$inspect`, `$host`). Sintaxe legada (`let x = 0` reativo implícito + `$:`) é reservada para migração (`npx sv migrate svelte-5`).

```svelte
<script lang="ts">
	let count = $state(0);
</script>

<button onclick={() => count++}>{count}</button>
```

Contra-mapa Svelte 4 → 5 (fonte: comunidade + guia de migração oficial):

| Anti-pattern (Svelte 4)           | Padrão (Svelte 5)                               |
| --------------------------------- | ----------------------------------------------- |
| `writable()`, `readable()` stores | `$state`/`$derived` em módulo `.svelte.ts`      |
| `export let name`                 | `let { name } = $props()`                       |
| `$: doubled = count * 2`          | `let doubled = $derived(count * 2)`             |
| `$: { sideEffect() }`             | `$effect(() => { sideEffect() })`               |
| Data fetching em `onMount`        | `load()` (SvelteKit — ver `sveltekit-patterns`) |
| `<slot />` / `<slot name="x">`    | Snippets `{#snippet}` + `{@render}`             |
| `on:click` / `on:submit`          | `onclick` / `onsubmit` (atributos lowercase)    |

Regras duras:

- Runes são **palavras-chave do compilador**, não imports — nunca `import { $state } from 'svelte'`.
- ⚠️ `let count = 0` sem `$state` em runes mode **não reativa** — a UI não atualiza.
- Nunca atribuir a uma variável `$derived` (read-only por construção).
- `$: {}` não existe mais; se o migrador gerar `run()` (`import { run } from 'svelte'`), refatorar para `$derived`/`$effect` quando possível.

## 4. Tipagem forte (regra)

- **Props sempre tipados** via interface + `$props()`.
- `$state`, `$derived`, stores e eventos com **tipos explícitos**; nunca `any`.
- Forma composta de estado → **interface explícita**; exportar tipos usados por outros módulos.
- Validar payloads de APIs com type guards (ver `typescript-best-practices`).
- Checagem com `svelte-check`, não apenas `tsc` — `npx svelte-check --tsconfig ./tsconfig.json` é gate junto com `vite build`.

```svelte
<script lang="ts">
	interface Props {
		title: string;
		items: Item[];
		variant?: 'primary' | 'secondary';
	}

	let { title, items, variant = 'primary' }: Props = $props();
</script>
```

## 5. Estado

### 5.1 Runes de estado

| Rune          | Uso                                                                               |
| ------------- | --------------------------------------------------------------------------------- |
| `$state`      | Estado local reativo (primitivos, objetos, arrays — reativo profundo)             |
| `$state.raw`  | Objeto **não** reativo profundo (perf p/ dados grandes que só serão reassignados) |
| `$derived`    | Valor **derivado** de outro estado — nunca efeito                                 |
| `$derived.by` | Derivação com bloco de código (expressão complexa)                                |
| `$props`      | Entrada (props) do componente                                                     |
| `$bindable`   | Prop de duas vias (v-model da Svelte)                                             |
| `$effect`     | **Side effects** (apenas quando necessário) + cleanup                             |
| `$inspect`    | Debugging reativo no console                                                      |
| `$host`       | Contexto de custom element (web components)                                       |

### 5.2 `$state` — primitivos e objetos

- ✅ Primitivos: `let count = $state(0)`.
- ✅ Objetos/shapes compostos: `$state` com objeto tipado inicial. Para **estados correlacionados de uma mesma feature**, agrupar em objeto/árvore tipada — evita múltiplos estados soltos e torna transições atômicas.

```svelte
<script lang="ts">
	// ❌ Negativo: campos correlacionados soltos
	let name = $state('');
	let email = $state('');
	let status = $state<'idle' | 'submitting' | 'success' | 'error'>('idle');
	let error = $state<string | null>(null);

	// ✅ Positivo: estado fortemente tipado único
	interface UserFormState {
		name: string;
		email: string;
		role: Role;
		status: 'idle' | 'submitting' | 'success' | 'error';
		error: string | null;
	}

	let form = $state<UserFormState>({
		name: '',
		email: '',
		role: 'user',
		status: 'idle',
		error: null,
	});

	function updateField<K extends keyof UserFormState>(key: K, value: UserFormState[K]) {
		form[key] = value;
	}

	// Troca inteira (ex.: reset) — reassign do objeto
	function reset() {
		form = { ...form, status: 'idle', error: null };
	}
</script>
```

Nota Svelte 5: `$state` com objeto/array é reativo **por item/propriedade** — você pode **mutar** `form.email` ou **reassignar** `form`. Use mutação para atualizações parciais e reassign para trocas de referência.

### 5.3 `$state.raw` — dados grandes sem reatividade profunda

Para objetos/arrays grandes que **não serão mutados** em propriedade (apenas substituídos por inteiro), `$state.raw` evita o custo da reatividade profunda.

```js
let person = $state.raw({ name: 'Heraclitus', age: 49 })

// ❌ sem efeito — mutação em $state.raw não dispara update
person.age += 1

// ✅ funciona — reassign cria uma nova referência
person = { name: 'Heraclitus', age: 50 }
```

### 5.4 `$derived` / `$derived.by` — derivação, nunca `$effect`

Regra: valores que podem ser **calculados** a partir de estado existente devem ser `$derived`, **nunca** `$effect` + mutação. `$derived.by` para expressões mais complexas.

```svelte
<script lang="ts">
	let todos = $state<Todo[]>([]);

	// ✅ Positivo: derivação simples
	let activeCount = $derived(todos.filter((t) => !t.completed).length);

	// ✅ Positivo: derivação complexa
	let firstPending = $derived.by(() => {
		if (todos.length === 0) return null;
		return todos.find((t) => !t.completed) ?? null;
	});

	// ❌ Negativo: efeito mutando estado para derivar valor
	let activeCount2 = $state(0);
	$effect(() => {
		activeCount2 = todos.filter((t) => !t.completed).length;
	});
</script>
```

`$derived` re-executa **lazy** quando as dependências mudam — um `console.log` dentro é enganoso.

### 5.5 `$effect` — apenas side effects

`$effect` deve ser usado **somente** para efeitos colaterais (logs, integração com lib não-Svelte, sincronização externa, listeners), nunca para derivar valor. Sempre retornar **cleanup** (Svelte o roda antes da próxima execução e na destruição do componente). `$effect` **não roda no servidor** — atenção ao SSR.

```svelte
<script lang="ts">
	let seconds = $state(0);

	$effect(() => {
		const timer = setInterval(() => {
			seconds += 1;
		}, 1000);

		// cleanup automático quando o efeito re-executa ou o componente é destruído
		return () => clearInterval(timer);
	});
</script>
```

- `$effect` roda após renderização — se precisar do DOM pronto ou evitar flicker, usar `$effect.pre` / `tick`.
- Para ignorar leitura reativa de outros valores dentro do efeito (evitar loops): `untrack(() => ...)`.
- Substitui `onMount` para lógica client-only; não duplicar com `onMount` + `$effect`.
- Dica: `untrack` também é útil para ler um valor dentro de `$effect` sem que ele vire dependência (evita re-execução acidental).

### 5.6 Máquina simples de UI

Para estado de carregamento/erro, usar um `status` único tipado, não múltiplos booleans contraditórios.

```ts
type LoadStatus = 'idle' | 'loading' | 'success' | 'error'
```

## 6. Props

### 6.1 `$props` tipado + defaults + rest

```svelte
<script lang="ts">
	interface Props {
		title: string;
		items: Item[];
		optional?: boolean;
	}

	let { title, items, optional = false, ...restProps }: Props = $props();

	// renomear: let { class: klass } = $props();
	// todas as props sem destructuring: let props = $props();
</script>

<!-- restProps passados via spread, ex.: atributos nativos -->
<input {...restProps} />
```

### 6.2 `$bindable` — duas vias

Props não são bindable por padrão. Usar `$bindable()` para criar props de duas vias (semelhante a `v-model`).

```svelte
<!-- FancyInput.svelte -->
<script lang="ts">
	interface Props {
		value: string;
	}

	let { value = $bindable() }: Props = $props();
</script>

<input bind:value={value} />
```

```svelte
<!-- App.svelte -->
<script lang="ts">
	import FancyInput from './FancyInput.svelte';

	let message = $state('hello');
</script>

<FancyInput bind:value={message} />
<p>{message}</p>
```

- ✅ Eventos de handlers via callbacks em props (ex.: `onSearch = (q: string) => void`).
- ❌ Não mutar prop read-only; usar `$bindable` quando o pai controla o valor.

## 7. Snippets e composição

Snippets (`{#snippet}` + `@render`) substituem 90% dos casos de slots (web). Slots são **legado em Svelte 5** — não criar `<slot />` em componentes novos.

```svelte
<!-- BaseLayout.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		header: Snippet;
		content?: Snippet<[number]>;
	}

	let { header, content }: Props = $props();
</script>

<header>{@render header()}</header>
<main>{@render content?.(42)}</main>
```

```svelte
<!-- Uso -->
<BaseLayout>
	{#snippet header()}<h1>Title</h1>{/snippet}
	{#snippet content(count)}<p>Recibido: {count}</p>{/snippet}
</BaseLayout>
```

- ✅ `Snippet` é **tipado** (`Snippet<[number]>` quando o snippet recebe args).
- ✅ Usar snippets para composição e evitar prop drilling; children simples pode usar `{@render children?.()}`.

## 8. Compartilhamento de estado

### 8.1 Context API (Svelte) — por árvore

Contexto do Svelte (`setContext`/`getContext`) para estado compartilhado entre pai e descendentes — **tipado** com `Symbol`/token de contexto.

```ts
// context.svelte.ts
import { getContext, setContext } from 'svelte'

const KEY = Symbol('FormContext')

export function setFormContext(state: FormState) {
  return setContext(KEY, state)
}

export function getFormContext() {
  return getContext<FormState>(KEY)
}
```

### 8.2 Estado global — módulo `.svelte.ts` com runes

Em Svelte 5, o caminho moderno para estado global/fora de componentes é exportar `$state` de um arquivo **`.svelte.ts`** — reativo em qualquer componente, sem boilerplate de stores (`writable` é legado).

> ⚠️ **Caveat da documentação**: você **não pode exportar estado reassignado** de um módulo `.svelte.ts` — consumidores de outros módulos não veem a reassignação. Para compartilhar estado mutável entre módulos, usar **objeto com propriedade mutável** ou **classe** (padrão "store runes").

```ts
// $lib/stores/user.svelte.ts
import type { User } from '$lib/types'

// ✅ Positivo: objeto com propriedade mutável — propagado entre módulos
export const currentUser = $state<{ value: User | null }>({ value: null })

export function setUser(user: User | null) {
  currentUser.value = user
}
```

```ts
// $lib/state/counter.svelte.ts — alternativa com classe
export class Counter {
  value = $state(0)

  increment() {
    this.value += 1
  }
}
```

```svelte
<!-- Uso no componente: leitura direta, sem prefixo $ -->
<script lang="ts">
	import { currentUser } from '$lib/stores/user.svelte';
</script>

{#if currentUser.value}
	<p>Olá, {currentUser.value.name}</p>
{/if}
```

- ✅ Estado global reativo em módulo `.svelte.ts` com runes.
- ✅ Para store legado (`writable`/`derived` de `svelte/store`) em libs existentes, consumir com `$store`; migrar para runes em código novo.
- ❌ Não usar `writable()` para código novo.
- ❌ Não criar store para estado puramente local de um único componente — usar `$state` no próprio componente.

## 9. Bindings e actions

### 9.1 `bind:` para inputs

```svelte
<script lang="ts">
	let search = $state('');
	let checked = $state(false);
</script>

<input bind:value={search} />
<input type="checkbox" bind:checked={checked} />
```

### 9.2 Actions (reuso de comportamento DOM)

Directiva `use:action` para reuso de comportamento (ex.: clique-fora, key capture).

```ts
// clickoutside.svelte.ts
export function clickOutside(node: HTMLElement, onOutside: () => void) {
  function handler(e: MouseEvent) {
    if (!node.contains(e.target as Node)) onOutside()
  }
  document.addEventListener('click', handler, true)
  return {
    destroy() {
      document.removeEventListener('click', handler, true)
    },
  }
}
```

```svelte
<script lang="ts">
	import { clickOutside } from '$lib/actions/clickoutside.svelte';
	let open = $state(false);
</script>

<div use:clickOutside={() => (open = false)}>...</div>
```

### 9.3 Transições

`transition:` / `in:` / `out:` / `animate:` para UX; usar apenas quando melhora legibilidade/percepção — medir performance antes de abusar.

## 10. Eventos e handlers

Em Svelte 5, eventos de DOM usam **atributos lowercase** (`onclick`, `onsubmit`, `oninput`), e eventos de componente são **callbacks via props** (não `createEventDispatcher` legado).

```svelte
<script lang="ts">
	interface Props {
		onSelect: (id: string) => void;
	}

	let { onSelect }: Props = $props();

	function handlePick(id: string) {
		onSelect(id);
	}
</script>

<button onclick={() => handlePick(item.id)}>Escolher</button>
```

- ❌ `on:click` / `createEventDispatcher` são sintaxe legada (removida no futuro).

## 11. Testing (Vitest + Testing Library/Svelte)

```ts
import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import Counter from './Counter.svelte'

describe('Counter', () => {
  it('incrementa ao clicar', async () => {
    const user = userEvent.setup()
    render(Counter)
    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveTextContent('1')
  })
})
```

- Testar comportamento, não implementação.
- Para estado derivado/lógica pura, testar via módulo `.svelte.ts` (classes/funções) sem montar componente.
- Rodar `svelte-check` junto com o test runner (tipos de `.svelte`).

## 12. Sinais de Alerta na Revisão (code smells)

| Signal                                                                                    | Ação                                                                  |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Sintaxe legada (`let x` reativo, `$:`, `createEventDispatcher`, `on:click`, `export let`) | Migrar para runes (`$state`/`$derived`/`$props`, atributos lowercase) |
| `writable()`/`readable()` stores novos                                                    | `$state`/`$derived` em módulo `.svelte.ts`                            |
| `$effect` derivando valor                                                                 | Trocar por `$derived`                                                 |
| Estado de UI booleano múltiplo (loading+error)                                            | `status` único tipado                                                 |
| Campos correlacionados em `$state` soltos                                                 | Objeto/árvore tipada única                                            |
| Props sem tipo / `any`                                                                    | Interface + `$props()`                                                |
| Props read-only mutada                                                                    | Usar `$bindable` ou callback                                          |
| `onMount` + `$effect` duplicando side effect                                              | Escolher um (preferir `$effect`)                                      |
| `onMount` fazendo data fetching                                                           | `load()` (SvelteKit — ver `sveltekit-patterns`)                       |
| `<slot />` novo                                                                           | Snippets + `{@render}`                                                |
| Vazamento de cleanup (timers/listeners/observers)                                         | Cleanup em `$effect`/`onDestroy`                                      |
| Estado reassignado exportado de `.svelte.ts`                                              | Objeto com propriedade mutável ou classe                              |

## 13. Referências cruzadas

- **`sveltekit-patterns`** — SvelteKit (load, form actions, hooks, `$app/state`, `$env`, SSR).
- **`frontend-patterns`** — consistência visual, UI Kit, semântica, acessibilidade, responsividade.
- **`typescript-best-practices`** — interfaces, discriminated unions, type guards.
- **`error-handling`** — hierarquia de erros, Result pattern, retry.
- **`staff-engineer/code-review-checklist`** — checklist genérico de revisão (cross-cutting).
- **`frontend-testing-strategy`** — detalhes de Vitest/Testing Library.
