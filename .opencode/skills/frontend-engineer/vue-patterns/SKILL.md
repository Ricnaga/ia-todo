---
name: vue-patterns
description: Use when building OR reviewing Vue 3 apps (Composition API, script setup), including state (ref, reactive, computed, Pinia), typed props (defineProps, defineEmits, defineModel), composables, slots, lifecycle and testing. For full-stack/SSR with Nuxt use nuxt-patterns instead. Trigger on keywords like "vue", "vue3", "vue 3", "script setup", "composition api", "ref", "reactive", "computed", "watch", "defineProps", "defineEmits", "defineModel", "pinia", "composable", "slot", "provide/inject", "unit test", "vitest", "vuetestutils".
metadata:
  audience: frontend-engineer, staff-engineer
  scope: vue
  mode: implementation-review
---

# Vue Patterns — Implementação e Revisão

Referência de padrões Vue 3 (Composition API / `<script setup>`) para **implementação** (frontend-engineer) e **revisão** (staff-engineer). Validado contra a documentação oficial do Vue (3.4+/3.5+) e práticas da comunidade (2026).

> Esta skill é uma referência de implementação e revisão, **não um conjunto de regras absolutas**. Use o bom senso contextual; quando um critério conflitar com o contexto real, documente a decisão.

> **Vue puro (SPA/CDN/components)** é coberto aqui. **Nuxt (full-stack, SSR, file-based routing, Nitro)** é coberto por `nuxt-patterns` — esta skill é a base que o Nuxt herda.

## 1. Objetivo

Definir padrões de desenvolvimento e revisão de código Vue 3 com Composition API, garantindo componentes legíveis, manuteníveis e — acima de tudo — **fortemente tipados** com TypeScript.

## 2. Agentes autorizados

| Agente              | Papel                                                                      |
| ------------------- | -------------------------------------------------------------------------- |
| `frontend-engineer` | Consulta antes de implementar ou refatorar componentes/funcionalidades Vue |
| `staff-engineer`    | Consulta durante revisões e auditorias de código Vue                       |

> **Acesso**: por contexto (trigger no `description`) — não há bloqueio por permissão. A pasta em que a skill vive indica **ownership** (quem a mantém), não audience. Agent fora do domínio deve delegar ao dono.

## 3. Convenção base: `<script setup>` + `lang="ts"`

Todo componente Vue deve usar `<script setup lang="ts">`. Nunca usar Options API em código novo (reservada apenas para migração).

```vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <button @click="count++">{{ count }}</button>
</template>
```

### 3.1 Estrutura de pastas e nomenclatura

Organização **por tipo** (top-level) + **colocation** de arquivos de uma mesma feature.

```
src/
├── main.ts              # entry point
├── App.vue
├── assets/              # imagens, fonts, estilos globais
├── components/          # componentes reutilizáveis (PascalCase)
├── composables/         # lógica reutilizável: use<Nome>.ts
├── stores/              # Pinia setup stores
├── services/            # chamadas HTTP (wrapper de axios/$fetch)
├── router/              # rotas (Vue Router)
├── types/               # interfaces/shapes compartilhados
├── utils/ ou lib/       # helpers puros (sem reatividade)
└── views/ ou pages/     # views de rota (vue-router)
```

**Colocation:** quando uma feature precisa de mais de um arquivo (componente + estado + lógica + teste), agrupá-los numa pasta própria — arquivos relacionados vivem juntos, não espalhados por tipo.

```
src/components/UserForm/
├── UserForm.vue          # componente (PascalCase)
├── useUserForm.ts        # estado/transições da feature (composable)
├── UserForm.test.ts      # teste colocado junto
└── types.ts              # tipos só da feature (se necessário)
```

- ✅ Componente + seus composables/testes na **mesma pasta** quando são específicos da feature.
- ✅ Estados/lógica de uma feature em composable **colocado com o componente** (`useUserForm.ts`).
- ✅ Tipos compartilhados em `types/`; tipos específicos da feature ficam junto dela.
- ✅ Serviços HTTP isolados em `services/` (um arquivo por recurso: `services/user.ts`).
- ✅ Nomenclatura: **arquivos kebab-case**, **componentes PascalCase**, **composables `useNome`**, **stores `useNomeStore`**.
- ✅ Mapeamento com a convenção do agent: `hooks/` → `composables/`, `lib/` → `utils|lib/`.
- ❌ Não criar pasta por tipo só para um único arquivo; colocar o arquivo onde é usado e só extrair quando houver 2+ usos.

## 4. Tipagem forte (regra)

- **Props e emits sempre tipados** via type-based syntax: `defineProps<Props>()` e `defineEmits<Emits>()`. Nunca runtime declaration (`defineProps({ foo: String })`).
- **Interfaces explícitas** para shapes compostos de estado — nunca objetos anônimos sem tipo ou `any`.
- **`ref`/`reactive`/`computed` com inferência do TS**; anotar explicitamente quando a inferência for insuficiente (`ref<Item[]>([])`).
- **Composables retornam tipos explícitos**; eventos de Payload tipados.
- Proibido `any`. Validar payloads de APIs com type guards (ver `typescript-best-practices`).

```ts
interface Props {
  title: string
  items: Item[]
  variant?: 'primary' | 'secondary'
}

const props = defineProps<Props>()
```

## 5. Estado

### 5.1 `ref` vs `reactive`

| Situação                                                   | Escolha                                                       |
| ---------------------------------------------------------- | ------------------------------------------------------------- |
| Valor primitivo, valor trocado por inteiro (re-assignment) | `ref`                                                         |
| Valor que muda dentro de um objeto (mutação de campo)      | `ref` com objeto, ou `reactive`                               |
| Estado com forma fixa e campos mutados em conjunto         | `reactive` + `toRefs`/desestruturação reativa (usar `toRefs`) |

```ts
// ✅ Positivo: ref para primitivos e reassignment
const loading = ref(false)
const user = ref<User | null>(null)

// ✅ Positivo: reactive para objeto com forma fixa
const form = reactive<UserFormState>({
  name: '',
  email: '',
  role: 'user',
})

// ❌ Negativo: reatividade perdida ao desestruturar reactive
const { name } = form // perde reatividade
```

- **Nunca desestruturar `reactive` diretamente** — embrulhar com `toRefs()`.
- **Preferir `ref` por padrão** (funciona para tudo e é mais explícito); `reactive` só quando facilita a leitura.

### 5.2 Estado mínimo (quanto menos, melhor)

Antes de criar estado, perguntar se ele é **derivável** (→ `computed`) ou **compartilhável** (→ Pinia/provide). Heurística:

1. Este valor é obtido por derivação de outro estado? → `computed`, não `ref`.
2. Este estado é compartilhado com outros componentes? → Pinia/provide.
3. Ele vive apenas em um componente para evitar re-criação? → repensar: extrair para subcomponente/composable antes de criar estado global.
4. Já existe estado que representa a mesma coisa? → reutilizar; nunca duplicar o mesmo dado em dois lugares reativos.

### 5.3 `computed` e derivação

Sempre que possível, deriva de estado existente com `computed` — nunca criar estado mutável para armazenar algo que pode ser obtido por derivação.

```ts
const todos = ref<Todo[]>([])

// ✅ Positivo: derivação com computed
const activeCount = computed(() => todos.value.filter((t) => t.completed).length)

// ❌ Negativo: estado desnecessário para valor derivável
const activeCount = ref(0)
watch(
  todos,
  () => {
    activeCount.value = todos.value.filter((t) => t.completed).length
  },
  { immediate: true },
)
```

- ✅ Derivar com `computed`; usar `watch` apenas para **efeitos** (side effects), não para derivar valor.
- ❌ Nunca mutar um `ref` dentro de um `watch` para produzir um valor derivado.

### 5.4 `watch` / `watchEffect`

- `watchEffect`: quando não se importa com quais dependências (rodar sempre que qualquer dep mudar), para efeitos.
- `watch`: quando se precisa do valor **anterior** (`oldValue`), ou quando a fonte é múltipla/flush específico.
- Sempre limpar timers/listeners em `onBeforeUnmount`.

```ts
watch([id, refreshKey], async ([newId, _newKey], [oldId]) => {
  if (newId !== oldId) {
    await loadItem(newId)
  }
})
```

### 5.5 Estado: tipos e forma

Estado de forma complexa usa objeto explícito tipado, evitando múltiplos `ref`/`reactive` soltos:

```ts
// ❌ Negativo: muitos refs soltos de uma mesma feature
const name = ref('')
const email = ref('')
const role = ref<Role>('user')
const status = ref<'idle' | 'submitting' | 'success' | 'error'>('idle')

// ✅ Positivo: 1 estado fortemente tipado
interface UserFormState {
  name: string
  email: string
  role: Role
  status: 'idle' | 'submitting' | 'success' | 'error'
  error: string | null
}

const form = reactive<UserFormState>({
  name: '',
  email: '',
  role: 'user',
  status: 'idle',
  error: null,
})

function updateField<K extends keyof UserFormState>(key: K, value: UserFormState[K]) {
  form[key] = value
}
```

Se as transições de estado têm lógica de negócio (validação, dependência entre campos), extrair para um **composable** (e.g. `useUserForm`) que encapsula o estado e os handlers.

### 5.6 Template refs tipadas — `useTemplateRef` (3.5+)

Referências de template tipadas sem a string mágica do `ref="..."`:

```vue
<script setup lang="ts">
const inputEl = useTemplateRef<HTMLInputElement>('my-input')
</script>

<template>
  <input ref="my-input" />
</template>
```

- ✅ Preferir `useTemplateRef` (3.5+) para refs de template; o tipo é inferido do elemento.
- ✅ `onWatcherCleanup` (3.5+) para limpeza dentro de callbacks de `watch`/`watchEffect` (além do `onCleanup` do 3º arg).

## 6. Typed Props / Emits / Model

### 6.1 `defineProps` e `defineEmits` type-only

```vue
<script setup lang="ts">
interface Props {
  title: string
  items: Item[]
  variant?: 'primary' | 'secondary'
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  count: 1,
})

const emit = defineEmits<{
  change: [id: number]
  submit: [value: string, done: boolean]
}>()

// Uso
emit('submit', 'hello', true)
</script>

<template>
  <h2>{{ title }}</h2>
</template>
```

- ✅ Sintaxe de tuple nomeado para emits (`submit: [value: string, done: boolean]`) — 3.3+.
- ✅ `withDefaults` para valores default em type-only props.
- ❌ Não misturar runtime + type declaration no mesmo `defineProps`.

### 6.2 `defineModel` (v-model tipado, 3.4+)

Preferir `defineModel` sobre manual `props.modelValue` + `emit("update:modelValue")`.

```ts
// Filho
const value = defineModel<string>({ required: true })
```

```html
<!-- Pai -->
<InputText v-model="search" />
```

### 6.3 Props mutáveis

- ❌ Nunca mutar `props` dentro do componente.
- Para estado controlado pelo pai → `defineModel` ou emit `update:*`.
- Para estado local iniciado por prop → inicializar `ref` local via `watch` com `{ immediate: true }` ou computar apenas.

## 7. Composables

Extrair para composable quando houver lógica reutilizável ou estado complexo que suje o componente. **Nunca antes de 2 usos reais** (DRY prematuro).

```ts
// useDebounceValue.ts
import { ref, computed, watch, type Ref } from 'vue'

export function useDebounceValue<T>(value: Ref<T>, delay = 300): Readonly<Ref<T>> {
  const debounced = ref(value.value) as Ref<T>

  watch(value, (v, _old, onCleanup) => {
    const timer = setTimeout(() => {
      debounced.value = v
    }, delay)

    // limpa o timer anterior sempre que o valor muda ou o watcher reinicia
    onCleanup(() => clearTimeout(timer))
  })

  return computed(() => debounced.value)
}
```

Obs.: `onCleanup` (3º arg do callback) funciona em qualquer versão Vue 3; `onWatcherCleanup` (global) é disponível no 3.5+. Continuar garantindo teardown de timers/listeners/observers.

Regra de nomenclatura: `useNomeDaFeature`.

## 8. Compartilhamento de estado

### 8.1 Pinia (store global)

Usar **Setup Stores** (componíveis, tipados naturalmente).

```ts
// stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => user.value !== null)

  async function load() {
    user.value = await fetchUser()
  }

  return { user, isAuthenticated, load }
})
```

- ✅ Setup Store: estado com `ref`/`reactive`, getters com `computed`, actions com funções.
- ✅ Acessar store de qualquer lugar (`useUserStore()`), nunca mutar state de fora da store (via actions).
- ❌ Não criar store que só orquestra dados locais — colocar junto ao componente/composable.
- ❌ Não acessar o estado de outra store direto; usar `useOutraStore()`.

### 8.2 `provide` / `inject`

Usar para estado compartilhado entre um pai e seus descendentes próximos (não global).

```ts
// Pai
import { provide } from 'vue'
provide<FormContext>('form-context', { state, updateField })

// Filho
import { inject } from 'vue'
const ctx = inject<FormContext>('form-context')
if (!ctx) throw new Error('form-context não fornecido')
```

- Usar **InjectionKey tipado** (`InjectionKey<FormContext>`) em arquivo compartilhado.
- ❌ Não usar `provide/inject` global quando Pinia resolve.

## 9. Slots

```vue
<!-- Card.vue -->
<template>
  <div class="rounded border p-4">
    <header v-if="$slots.header"><slot name="header" /></header>
    <slot />
  </div>
</template>
```

- ✅ Usar slots para composição (children), evitando prop drilling.
- ✅ Tipar slot props com `defineSlots` (3.3+) quando o slot recebe dados.

## 10. Lifecycle e teardown

- `onMounted`: setup inicial (nunca fetch dentro de `setup()` síncrono se precisar esperar; usar `async setup` só quando necessário).
- `onBeforeUnmount`: limpar listeners, timers, observers, subscriptions.
- `onErrorCaptured`: error boundary — isolar falhas de subárvores.

```ts
onMounted(() => {
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})
```

## 11. Tratamento de erros

- **Assíncrono (API)**: tratar com `try/catch` no composable/componente; estado tipado `error: string | null`.
- **UI**: um estado `status: "idle" | "loading" | "success" | "error"` em vez de múltiplos booleans contraditórios.

```vue
<script setup lang="ts">
import { useItems } from '../composables/useItems'

// Composable próprio do projeto (fetch + refs). Em Vue puro não existe useFetch
// global — isso é padrão Nuxt (ver nuxt-patterns). Aqui o fetch vive no composable.
const { data, status, error, refresh } = useItems()
</script>

<template>
  <div v-if="status === 'loading'">Carregando...</div>
  <div v-else-if="status === 'error'">{{ error }}</div>
  <ul v-else>
    <li v-for="item in data" :key="item.id">{{ item.name }}</li>
  </ul>
</template>
```

- `v-for` sempre com `:key` estável (id), nunca index quando a ordem pode mudar.

## 12. Performance

- `computed` para derivação (evita recálculo).
- `v-memo` e componentes com `defineOptions({ inheritAttrs: false })` sob medida, apenas quando medido.
- Lazy-load de componentes e rotas (Vue Router `defineAsyncComponent` / dynamic import) sob demanda.
- ❌ Otimização reativa preventiva sem medição.

## 13. Testing (Vitest + Vue Test Utils)

```ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import UserCard from './UserCard.vue'

describe('UserCard', () => {
  it('renderiza o título', () => {
    const wrapper = mount(UserCard, { props: { title: 'Olá', items: [] } })
    expect(wrapper.find('h2').text()).toBe('Olá')
  })
})
```

- Usar `@vue/test-utils` + Vitest; testar comportamento, não implementação.
- Para estado/composables, testar via componente de teste ou extrair composable puro.

## 14. Sinais de Alerta na Revisão (code smells)

| Signal                                          | Ação                                   |
| ----------------------------------------------- | -------------------------------------- |
| Options API em código novo                      | Migrar para `<script setup lang="ts">` |
| Props/emits sem tipo (runtime declaration)      | Type-based `defineProps`/`defineEmits` |
| Estado reativo não tipado / `any`               | Tipar shapes compostos com interface   |
| Múltiplos `ref` soltos da mesma feature         | Objeto tipado único ou composable      |
| Derivação via `watch`+mutação                   | `computed`                             |
| Desestruturar `reactive` sem `toRefs`           | `toRefs` ou `ref`                      |
| `props` mutado dentro do componente             | `defineModel`/emit                     |
| Store Pinia para estado puramente local         | Manter no componente/composable        |
| `v-for` sem key estável                         | `:key="item.id"`                       |
| Múltiplos booleans para loading/error           | `status` único tipado                  |
| Lógica de negócio dentro do template/componente | Extrair para composable/serviço        |

## 15. Referências cruzadas

- **`nuxt-patterns`** — Nuxt 4 (páginas, `useFetch`, `server/api`) quando o projeto não é SPA Vue puro — o Nuxt herda os padrões desta skill.
- **`frontend-patterns`** — consistência visual, UI Kit, semântica, acessibilidade, responsividade.
- **`typescript-best-practices`** — interfaces, discriminated unions, type guards.
- **`staff-engineer/code-review-checklist`** — checklist genérico de revisão (cross-cutting).
