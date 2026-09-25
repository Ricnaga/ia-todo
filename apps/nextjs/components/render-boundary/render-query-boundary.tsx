'use client'

import { QueryErrorResetBoundary } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { RenderBoundary, type RenderBoundaryProps } from './render-boundary'

export type RenderQueryBoundaryProps = {
  children: ReactNode
  fallback?: RenderBoundaryProps['fallback']
  errorFallback?: RenderBoundaryProps['errorFallback']
}

export function RenderQueryBoundary({
  children,
  fallback,
  errorFallback,
}: RenderQueryBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }: { reset: () => void }) => (
        <RenderBoundary fallback={fallback} errorFallback={errorFallback} onReset={reset}>
          {children}
        </RenderBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
