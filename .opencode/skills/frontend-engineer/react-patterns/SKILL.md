---
name: react-patterns
description: Use when building OR reviewing React components, hooks, props, state, rendering and performance. Covers composition, compound components, custom hooks, prop drilling, ternary, mapping objects, early returns, and code smells. Trigger on keywords like "react", "component", "hook", "useState", "useEffect", "props", "re-render", "memo", "compound component", "code review", "review", "code smell", "prop drilling", "ternary", "render".
metadata:
  audience: frontend-engineer, staff-engineer
  scope: react
  mode: implementation-review
---

# React Patterns — Implementação e Revisão

Referência de padrões React para **implementação** (frontend-engineer) e **revisão** (staff-engineer).

> Esta skill é uma referência de implementação e revisão, **não um conjunto de regras absolutas**. Use o bom senso contextual; quando um critério conflitar com o contexto real, documente a decisão.

## 1. Objetivo

Definir padrões de desenvolvimento e revisão de código React, garantindo componentes legíveis, manuteníveis e alinhados com boas práticas — tanto na criação quanto na revisão.

## 2. Agentes autorizados

| Agente              | Papel                                                                        |
| ------------------- | ---------------------------------------------------------------------------- |
| `frontend-engineer` | Consulta antes de implementar ou refatorar componentes/funcionalidades React |
| `staff-engineer`    | Consulta durante revisões e auditorias de código React                       |

> Enforcement efetivo: `permission.skill` (ver `opencode.json`). A pasta em que a skill vive é **ownership**, não audience.

## 3. Quando consultar

- **Implementação (frontend-engineer):** antes de criar/refatorar um componente, hook, estado ou estratégia de renderização.
- **Revisão (staff-engineer):** durante review de PRs, auditorias de componentes ou validação de padrões React.

## 4. Regras de Implementação

### 4.1 Composição de componentes

Preferir composição (children / compound components) a prop drilling.

```tsx
// ✅ Positivo: composição com children
interface CardProps {
  children: React.ReactNode
}

function Card({ children }: CardProps) {
  return <div className="rounded-lg border p-4">{children}</div>
}

Card.Header = function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="border-b pb-2">{children}</div>
}

// Uso
<Card>
  <Card.Header>Title</Card.Header>
  <p>Content</p>
</Card>
```

```tsx
// ❌ Negativo: prop drilling desnecessário
<Dashboard user={user} onUserUpdate={handleUpdate} />
// → cada nível repassa props que não usa, só para chegar ao destino
```

### 4.2 Compound Components

Usar quando um grupo de componentes compartilha estado implícito e lógica acoplada (ex: `Select` + `Option`, `Tabs` + `Tab`). Expor o estado via `Context` interno.

- ✅ Usar quando: o grupo de props acopladas cresce e o consumidor precisa controlar estados correlacionados (seleção, abertura, foco).
- ❌ Não usar quando: basta um componente simples ou um `children` único.

### 4.3 Custom Hooks

Extrair para hook quando houver lógica reutilizável ou estado complexo que suje o componente. Nomear com prefixo `use`. **Nunca extrair antes de 2 usos reais** (DRY prematuro).

```tsx
// ✅ Positivo: hook com tipagem e cleanup
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
```

### 4.4 Estado

- **Tipagem explícita e legível:** nunca objeto anônimo inline no `useState`. Estado de objeto extrai um `type`/`interface` nomeado fora do componente; booleano de UI com anotação explícita.

```tsx
// ❌ Negativo: objeto anônimo inline + booleano sem anotação
const [formModal, setFormModal] = useState<{ mode: 'create' | 'edit'; todo?: Todo } | null>(null)
const [opened, setOpened] = useState(false)

// ✅ Positivo: type nomeado + boolean anotado
type FormModalState = { mode: 'create' | 'edit'; todo?: Todo }
const [formModal, setFormModal] = useState<FormModalState | null>(null)
const [opened, setOpened] = useState<boolean>(false)
```

- **Inferência da lib:** no restante, deixe o TypeScript inferir (`useState("")` → `string`). Anotar quando a inferência for insuficiente: `useState([])` → `never[]` (use `useState<Item[]>([])`), `useState<User | null>(null)`.

- **Muitos `useState`:** se um componente acumula muitos estados relacionados, avalie agrupar em uma interface tipada **apenas quando** isso reduzir re-renders parciais e clobber. Estado-objeto tem custo (stale reads, mais re-renders) — avalie por contexto, não por contagem fixa.

```tsx
// ✅ Positivo: estados relacionados agrupados quando há atualização parcial frequente
interface UserFormState {
  name: string
  email: string
  role: Role
}

function UserForm() {
  const [state, setState] = useState<UserFormState>({
    name: '',
    email: '',
    role: 'user',
  })

  const updateField = (partial: Partial<UserFormState>) => {
    setState((prev) => ({ ...prev, ...partial }))
  }
  // ...
}
```

- **Transições complexas:** se o estado tem lógica de transição com múltiplas ações, extrair para `useReducer` em arquivo dedicado: `<nome>.reducer.ts`.

```
components/
└── UserForm/
    ├── UserForm.tsx
    ├── UserForm.reducer.ts
    └── UserForm.test.tsx
```

- **Colocation:** manter o estado o mais próximo possível de onde é usado. Context só quando o prop drilling supera o custo do contexto.

### 4.5 Listas

```tsx
// ✅ Positivo: key estável e única
function List({ items }: { items: Item[] }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  )
}
```

- ✅ Usar IDs únicos estáveis.
- ❌ Nunca usar index do array como key quando a ordem pode mudar.
- ❌ Nunca usar `Math.random()` como key.

### 4.6 Conditional rendering

Preferir **early return** quando melhorar a legibilidade. `&&` / ternário apenas para casos simples.

```tsx
// ✅ Positivo: early return
function Greeting({ name }: { name?: string }) {
  if (!name) return null
  return <h1>Olá, {name}</h1>
}

// ✅ Positivo: fallback null com &&
return isVisible && <Component />

// ❌ Negativo: ternário aninhado
return isAdmin ? <AdminPanel /> : isOwner ? <OwnerPanel /> : <GuestPanel />
```

#### 4.6.1 Nunca usar ternário aninhado

Ternários encadeados (3+ níveis) comprometem a legibilidade. Usar early return, mapping object ou switch.

```tsx
// ❌ Negativo: ternário aninhado
return isAdmin ? <AdminPanel /> : isOwner ? <OwnerPanel /> : <GuestPanel />

// ✅ Positivo: early return
if (isAdmin) return <AdminPanel />
if (isOwner) return <OwnerPanel />
return <GuestPanel />

// ✅ Positivo: mapping object
const PANEL: Record<Role, React.ReactNode> = {
  admin: <AdminPanel />,
  owner: <OwnerPanel />,
  guest: <GuestPanel />,
}
return PANEL[role] ?? null
```

#### 4.6.2 Nunca colocar ternário no meio do JSX

Ternários inline no JSX poluem a leitura. Preferir **componentizar** e usar return early.

```tsx
// ❌ Negativo: ternário no meio do JSX
return (
  <div>
    <Header />
    {isLoggedIn ? <UserMenu /> : <LoginButton />}
    <Footer />
  </div>
)

// ✅ Positivo: componentizar + return early
function AppHeader() {
  if (!isLoggedIn) return <LoginButton />
  return <UserMenu />
}

// Uso no pai — JSX limpo
return (
  <div>
    <Header />
    <AppHeader />
    <Footer />
  </div>
)
```

#### 4.6.3 Não criar variáveis nem lógica no meio do JSX

Toda lógica computacional (filter, map com lógica complexa, cálculos) deve ficar **antes do return**.

```tsx
// ❌ Negativo: lógica no meio do JSX
return (
  <div>
    {items
      .filter((i) => i.active)
      .map((i) => (
        <Item key={i.id} {...i} />
      ))}
  </div>
)

// ✅ Positivo: lógica antes do return
const activeItems = items.filter((i) => i.active)
return (
  <div>
    {activeItems.map((i) => (
      <Item key={i.id} {...i} />
    ))}
  </div>
)
```

#### 4.6.4 Padrões de fallback

```tsx
// ✅ Fallback null com &&
return isVisible && <Component />

// ✅ Valor booleano com fallback
const isActive = isEnabled ?? false
const label = displayName || 'Sem nome'

// ❌ Negativo: ternário com fallback null no meio do JSX
return <div>{isLoaded ? <Content /> : null}</div>

// ✅ Positivo: &&
return <div>{isLoaded && <Content />}</div>
```

### 4.7 Performance

`React.memo`, `useMemo` e `useCallback` **sob medida**, nunca preventivos. Medir antes de otimizar.

```tsx
// ✅ Positivo: memo quando re-render é custoso e verificado
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }: Props) {
  return <div>{/* renderização custosa */}</div>
})
```

- ✅ Aplicar `useCallback`/`useMemo` quando há problema mensurável ou dependência de efeito que dispara em excesso.
- ❌ Não embrulhar todo valor/callback em `useMemo`/`useCallback` "por garantia".

### 4.8 Mutações (React Query)

Preferir `mutate` + callbacks (`onSuccess`/`onError`) a `mutateAsync`. O `mutateAsync` retorna uma Promise que **rejeita** quando a mutation falha — sem `catch`/`try/catch` vira _unhandled promise rejection_; com o `onError` já exibindo o toast, o `catch` só existiria para engolir a rejeição.

```tsx
// ✅ Positivo: mutate + callbacks, guard clause, fecha o modal só no sucesso
const onSubmit = (values: Values) => {
  if (!editing) {
    createMutation.mutate(values, {
      onSuccess: () => {
        notifySuccess('Criado', 'Tarefa criada.')
        setModalOpen(null)
      },
      onError: notifyError('Erro ao criar'),
    })
    return
  }
  updateMutation.mutate(
    { id: editing.id, input: values },
    {
      onSuccess: () => {
        notifySuccess('Atualizado', 'Alterações salvas.')
        setModalOpen(null)
      },
      onError: notifyError('Erro ao atualizar'),
    },
  )
}

// ❌ Negativo: mutateAsync + try/catch vazio + else
try {
  if (editing) {
    await updateMutation.mutateAsync(
      { id: editing.id, input: values },
      { onError: notifyError('Erro') },
    )
  } else {
    await createMutation.mutateAsync(values, { onError: notifyError('Erro') })
  }
  setModalOpen(null)
} catch {}
```

- ✅ Fechar modal / limpar estado **somente no `onSuccess`** (erro preserva o form e mostra o toast via `onError`).
- ✅ Usar guard clause (early return) em vez de `if/else` quando um branch encerra o fluxo.
- ❌ `mutateAsync` sem `catch`: unhandled rejection.
- ❌ `try { await mutateAsync(...) } catch {}` ou `.catch(() => null)` só para suprimir rejeição — trocar por `mutate`.

## 5. Sinais de Alerta na Revisão (code smells)

### 5.1 Complexidade de componente

Sinais: componente muito extenso, muitas responsabilidades, JSX embutido em excesso. → Extrair subcomponentes, hooks ou composição.

### 5.2 Quantidade excessiva de props

Muitas props (especialmente booleanas) indicam responsabilidades demais. → Agrupar em objeto tipado, usar Compound Component, ou repassar via `children`.

### 5.3 Ternários aninhados e no meio do JSX

Ternários encadeados ou inline no JSX são difíceis de ler. → Early return, componentizar, mapping object ou `switch`. Nunca aninhar ternários; nunca colocar ternário no meio do JSX — extrair para componente com return early.

### 5.4 Múltiplos estados de renderização

Quando há várias variantes visuais guiadas por um estado, um **objeto de mapeamento** (`Record<Estado, Componente>`) é mais legível que cadeias de `&&`.

```tsx
// ✅ Positivo: mapping object
const STATUS_VIEW: Record<Status, React.ReactNode> = {
  loading: <Spinner />,
  success: <SuccessView />,
  error: <ErrorView retry={onRetry} />,
  empty: <EmptyView />,
}

return STATUS_VIEW[status] ?? null
```

### 5.5 Decisão baseada em estado → `switch`

Quando a lógica decide comportamento por enum/estado com múltiplos branches, um `switch` tipado (ou o mapping object) representa melhor que ternários encadeados.

```tsx
// ✅ Positivo: switch explícito em reducer
switch (action.type) {
  case 'SUBMIT_START':
    return { ...state, loading: true, error: null }
  case 'SUBMIT_SUCCESS':
    return { ...state, loading: false }
  case 'SUBMIT_ERROR':
    return { ...state, loading: false, error: action.error }
  default:
    return state
}
```

### 5.6 Separação componente / hook / regra de negócio

Regra de negócio no JSX ou no componente é smell. → Mover para service/hook; manter o componente apresentacional (estado de UI local).

### 5.7 Abstração prematura

Extrair componente/hook/generic sem pelo menos 2 usos reais é YAGNI. → Não extrair; a duplicação eventual a 3+ usos justifica a abstração.

## 6. Critérios de Decisão

Tabela condição → ação. Referência, não regra absoluta:

| Condição observada                                        | Ação sugerida                                        |
| --------------------------------------------------------- | ---------------------------------------------------- |
| Componente muito extenso ou com muitas responsabilidades  | Extrair subcomponentes / hooks / composição          |
| Muitas props (esp. booleanas)                             | Objeto tipado, Compound Component ou `children`      |
| Ternário aninhado (3+ níveis)                             | Early return, mapping object, subcomponente          |
| Ternário no meio do JSX                                   | Componentizar + return early                         |
| Lógica/variáveis no meio do JSX                           | Extrair lógica antes do return                       |
| Várias variantes de renderização por estado               | `Record<Estado, Componente>` (mapping object)        |
| Decisão por enum/estado com vários branches               | `switch` (legibilidade > ternário encadeado)         |
| Lógica de negócio dentro do JSX/componente                | Mover para hook/service (componente apresentacional) |
| Extração sem 2+ usos reais                                | **Não extrair** (YAGNI / abstração prematura)        |
| `useMemo`/`useCallback` sem problema mensurável           | **Não otimizar preventivamente**                     |
| Key por index quando a ordem pode mudar                   | Corrigir para ID estável                             |
| Prop drilling excessivo                                   | Context / composição / colocation de estado          |
| Estado de objeto anônimo inline no `useState`             | Extrair `type`/`interface` nomeado no arquivo        |
| Booleano de UI sem anotação                               | `useState<boolean>(false)`                           |
| `mutateAsync` usado só para disparar a mutation           | Trocar por `mutate` + `onSuccess`/`onError`          |
| `try/catch` vazio ou `.catch(() => null)` suprimindo erro | Trocar por `mutate` + `onError` (toast)              |
| `if/else` com um branch que encerra o fluxo               | Guard clause (early return)                          |

## 7. Exemplos Positivos

Consolidado (também interleaved nas seções 4 e 5):

- Composição com `children` em vez de prop drilling (`4.1`).
- Mapping object para múltiplos estados de renderização (`5.4`).
- `switch` tipado em reducer para transições de estado (`5.5`).
- Early return antes de JSX condicional complexo (`4.6`).
- `type` nomeado para estado de objeto + booleano anotado (`4.4`).
- `mutate` + callbacks, modal fechado só no sucesso, guard clause (`4.8`).
- Componentizar ternário do JSX + return early (`4.6.2`).
- Lógica extraída antes do return, JSX limpo (`4.6.3`).
- Hook extraído somente após 2+ usos reais (`4.3`).

## 8. Exemplos Negativos

Consolidado (também interleaved nas seções 4 e 5):

- Ternários aninhados no JSX (`4.6`, `4.6.1`).
- Ternário no meio do JSX sem componentizar (`4.6.2`).
- Lógica/variáveis no meio do JSX (`4.6.3`).
- Prop drilling de responsabilidades que atravessam níveis sem uso (`4.1`).
- Estado de objeto anônimo inline no `useState` e booleano sem `boolean` (`4.4`).
- `mutateAsync` sem `catch` / `try { await mutateAsync } catch {}` (`4.8`).
- `if/else` que seria guard clause e modal fechado fora do `onSuccess` (`4.8`).
- `useMemo`/`useCallback` preventivos (`4.7`).
- Key por index do array (`4.5`).
- Regra de negócio embutida no JSX (`5.6`).
- Abstração criada antes do 2º uso real (`5.7`).

## 9. Referências cruzadas

- **`nextjs-patterns`** — Server vs Client Components, Suspense, `use server` (web).
- **`react-native-patterns`** — componentes nativos, FlatList, StyleSheet.
- **`frontend-patterns`** — consistência visual, UI Kit, semântica, acessibilidade, responsividade.
- **`staff-engineer/code-review-checklist`** — checklist genérico de revisão (cross-cutting).
