'use client'
import type { ReactNode } from 'react'
import { ReactQueryProvider } from './react-query'
import { ThemeProvider } from './theme'

type ProvidersProps = {
  children: ReactNode
}

/**
 * Composition root: a arvore global de providers do app, nesta ordem. Quem
 * protege a sessao em tempo de execucao mora em `app/(private)/layout.tsx`,
 * junto do `verifySession()` -- escopo dele e a arvore privada, nao o app todo.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ReactQueryProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </ReactQueryProvider>
  )
}
