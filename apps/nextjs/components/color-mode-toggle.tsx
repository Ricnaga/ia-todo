'use client'

import { Button, useMantineColorScheme, type ButtonProps } from '@mantine/core'

/**
 * Alterna light/dark.
 *
 * `modes.css` reage a `data-mantine-color-scheme`, que e o atributo que o proprio
 * Mantine escreve. O provider e a UI nao reescrevem `data-mode`, entao nao ha
 * duas fontes de verdade para divergirem.
 *
 * O icone e escolhido por CSS (`dark:hidden` / `hidden dark:inline`) em vez de
 * JS: `useComputedColorScheme` devolve `undefined` no servidor, e decidir o
 * icone no cliente produziria hydration mismatch. Como o `dark` do Tailwind
 * le o mesmo atributo do Mantine, CSS e JS nunca discordam.
 */
export function ColorModeToggle(props: ButtonProps) {
  const { toggleColorScheme } = useMantineColorScheme()

  return (
    <Button
      {...props}
      variant="default"
      aria-label="Alternar tema"
      title="Alternar tema"
      onClick={() => toggleColorScheme()}
    >
      <span aria-hidden="true" className="dark:hidden">
        ☀
      </span>
      <span aria-hidden="true" className="hidden dark:inline">
        ☾
      </span>
    </Button>
  )
}
