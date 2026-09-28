# @ia-task-manager/design-tokens

Tokens de design compartilhados pelos tres frontends do monorepo. A fonte da
verdade e **CSS puro** — nao ha objeto de tokens em JS, nem geracao de codigo.

Os arquivos sao organizados por categoria do design system, e cada categoria usa
o namespace que o Tailwind v4 ja reserva para ela. Isso importa: um token em
`--radius-*` vira `rounded-md`, um em `--shadow-*` vira `shadow-md`, sem nenhuma
configuracao a mais.

```
src/
  index.css        entry point — importa tudo
  modes.css        como light/dark e resolvido (nao define valor)
  colors.css       ramps --color-<ramp>-<50..950>  (nao-layered, ver abaixo)
  spacing.css      --spacing
  radius.css       --radius-*
  typography.css   --font-*, --text-*, --leading-*, --tracking-*, --font-weight-*
  shadow.css       --color-shadow* (modo) + --shadow-* (escala)
  motion.css       --ease-*, --duration-*
  semantic.css     a camada que o produto consome
  adapters/
    mantine.css    --mantine-*            -> --ds-*
    nuxt-ui.css    --ui-*                 -> --ds-*
    skeleton.css   --typo-*, --corner-*  -> --ds-*
```

## Como importar

Os tokens precisam vir **depois** da biblioteca de componentes do app na ordem
de origem do CSS, porque eles sobrescrevem a paleta propria de cada biblioteca.

```css
/* Skeleton */
@import 'tailwindcss';
@import '@skeletonlabs/skeleton';
@import '@skeletonlabs/skeleton-svelte';
@import '@ia-task-manager/design-tokens/index.css';
@import '@ia-task-manager/design-tokens/adapters/skeleton.css';
```

```css
/* Nuxt UI */
@import 'tailwindcss';
@import '@nuxt/ui';
@import '@ia-task-manager/design-tokens/index.css';
@import '@ia-task-manager/design-tokens/adapters/nuxt-ui.css';
```

```css
/* Mantine */
@import 'tailwindcss';
@import '@ia-task-manager/design-tokens/index.css';
@import '@ia-task-manager/design-tokens/adapters/mantine.css';
```

Cada app ainda precisa de uma peca em JS, porque cada biblioteca guarda a paleta
em lugar diferente:

| App         | Pica                 | O que faz                                                                  |
| ----------- | -------------------- | -------------------------------------------------------------------------- |
| `nextjs`    | `app/theme/index.ts` | `createTheme` com as ramps em `var()`, e `primaryShade` casando com o modo |
| `nuxt`      | `app/app.config.ts`  | mapeia os nomes de cor do Nuxt UI para as ramps                            |
| `sveltekit` | —                    | le `--color-*` direto; o `base/theme.css` do Skeleton ja serve de fallback |

## As tres camadas

### Primitivas — por categoria

Nao conhecem modos. `colors.css` traz 8 ramps de 11 tons em OKLCH (`primary`,
`secondary`, `tertiary`, `info`, `success`, `warning`, `error`, `surface`), cada
uma com `contrast-light`/`contrast-dark` que espelham a propria ramp para dar
texto legivel sobre superficies daquela cor. As demais categorias sao escalas
normais do Tailwind.

**As ramps nao viram utilities, de proposito.** Elas existem para as bibliotecas
de componentes, que as leem pelo nome. Deixar `bg-primary-600` disponivel
convidaria o time a pular a camada semantica.

### `semantic.css` — o que um componente consome

`--ds-bg`, `--ds-fg`, `--ds-accent`, `--ds-border`, … Cada um tem um par
`--ds-x-light` / `--ds-x-dark` resolvido por `light-dark()`, o que faz a troca de
modo ser um unico `color-scheme` em vez de uma segunda paleta.

Estes sim viram utilities (`bg-bg`, `text-fg`, `bg-accent`).

So cor tem versao light/dark. Spacing, radius, typography, shadow e motion sao
as mesmas nos dois modos, entao nao carregam dados duplicados.

### `modes.css` — como o modo e resolvido

Tres faixas, do mais fraco ao mais forte:

1. `:root` → light
2. `@media (prefers-color-scheme: dark)` → dark, apenas se o app nao fixou
3. atributo/classe explicito → dark

O atributo vive no `<html>` e e escutado em tres formas equivalentes, cada app
usando o mecanismo nativo da sua biblioteca:

| Seletor                       | Quem escreve                       |
| ----------------------------- | ---------------------------------- |
| `[data-mode]`                 | script anti-FOUC do `sveltekit`    |
| `.light` / `.dark`            | `@nuxtjs/color-mode` (via Nuxt UI) |
| `[data-mantine-color-scheme]` | `ColorSchemeScript` do Mantine     |

Os seletores nao precisam estar sincronizados a mao, e nenhum app reescreve
`data-mode` quando sua biblioteca ja escreve outro atributo — assim nao ha duas
fontes de verdade para divergirem.

## Por que `colors.css` e nao-layered

O Tailwind v4 emite `@theme` dentro de `@layer theme`. Em CSS, **regra
nao-layered vence regra layered**. O `base/theme.css` do Skeleton e o tema do
Nuxt UI declaram os mesmos nomes de ramp em CSS nao-layered, entao as ramps
declaradas em `@theme` seriam silenciosamente ignoradas.

Por isso `colors.css` e o unico arquivo de primitivas fora de `@theme`:

- **`:root` nao-layered** — as ramps. Vencem por ordem de origem.
- **`@theme`** — as escalas das outras categorias, cujos nomes nao colidem e por
  isso viram utilities normalmente.

O mesmo vale para o vocabulario que cada biblioteca inventou: `--radius-base` e
`--corner-shape-*` (Skeleton), `--ui-radius` (Nuxt UI) e `--mantine-radius-*`
(Mantine) estao nos adapters, nao em `radius.css`. Sao nomes diferentes para a
mesma ideia, e cada um precisa da sua ponte.

## Por que `@theme static`

O Tailwind so emite uma variavel de `@theme` se alguma utility a usou. Num design
system isso esta errado por dois motivos:

1. **O contrato precisa ser estavel.** `bg-surface-raised` e um token do sistema;
   nao deve existir so porque alguem escreveu essa classe hoje.
2. **O Tailwind nao ve as referencias dos adapters.** `mantine.css`,
   `nuxt-ui.css` e `skeleton.css` leem `--radius-sm`, `--shadow-md`,
   `--text-lg` de CSS plano. O scanner so enxerga classes Tailwind, entao nao
   marca essas variaveis como usadas.

Sem `static`, `--mantine-shadow-md: var(--shadow-md)` resolveria para vazio em
qualquer tela que ainda nao tivesse `shadow-md` como classe — e o bug so
apareceria em rotas que ninguem testou. `static` emite o bloco inteiro sempre.

`colors.css` nao precisa de `static`: as ramps sao `:root` puro, fora do alcance
do Tailwind.

## Contraste

Os valores de `--ds-fg-subtle` e `--ds-border-strong` foram calculados por
bisseccao, nao escolhidos a olho, para ficarem acima de 4.5:1 e de 3:1 contra o
fundo de cada modo. Se voce mexer em `--ds-bg`, `--ds-fg-subtle`,
`--ds-border-strong` ou no acento, revalide: a camada semantica nao tem como se
corrigir sozinha, porque nao ha cor literal para cair no lugar.

Bordas e aneis de foco seguem 3:1 (WCAG 1.4.11, nao-texto), nao 4.5:1.

## Alterando uma cor

1. Edite os valores da ramp em `colors.css`.
2. Se a mudanca e de identidade, ajuste tambem `--ds-accent-*` em
   `semantic.css`. Hoje o acento e `primary-600` no light e `primary-400` no
   dark — o 400 existe porque o tom precisa atingir 4.5:1 sobre o fundo **e**
   receber texto escuro com 4.5:1, coisa que o 500 nao consegue.
3. Se mudar a ramp usada como `primary`, ajuste `primaryShade` no
   `app/theme/index.ts` do Next para continuar casando com o passo 2. Hoje
   `{ light: 6, dark: 4 }`.

Se voce adicionar uma ramp nova, mapeie o nome tambem no `app/app.config.ts` do
Nuxt — sem o mapeamento o Nuxt UI emite `var(--color-<nome>-<ton>, )` com
fallback vazio.

## Estilos de codigo

O CSS nao tem lint dedicated, entao comentarios explicam o _porqueda_ de cada
decisao nao obvio. Nomes de token e indentacao seguem o que o Prettier do root
formata; rode `pnpm format` antes de commitar.
