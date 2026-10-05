'use client'
import type { ReactNode } from 'react'
import { ReactQueryProvider } from './react-query'
import { ThemeProvider } from './theme'

type ProvidersProps = {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ReactQueryProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </ReactQueryProvider>
  )
}
