'use client'

import type { ReactNode } from 'react'
import { SessionGuard } from '@/components/session-guard/session-guard'
import { ReactQueryProvider } from './react-query'
import { ThemeProvider } from './theme'

type ProvidersProps = {
  children: ReactNode
}

/**
 * Composition root: a arvore global de providers do app, nesta ordem.
 *
 * O ReactQueryProvider vem por fora do ThemeProvider porque o SessionGuard le
 * o QueryClient e o cache das queries, e nao a paleta.
 */ export function Providers({ children }: ProvidersProps) {
  return (
    <ReactQueryProvider>
      <ThemeProvider>
        <SessionGuard />
        {children}
      </ThemeProvider>
    </ReactQueryProvider>
  )
}
