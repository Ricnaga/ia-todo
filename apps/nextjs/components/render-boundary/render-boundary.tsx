'use client'

import { Suspense, type ReactNode } from 'react'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { ErrorState } from '@/components/error-state/error-state'
import { LoadingState } from '@/components/loading-state/loading-state'

export type RenderBoundaryProps = {
  children: ReactNode
  fallback?: ReactNode
  errorFallback?: ((props: FallbackProps) => ReactNode) | ReactNode
  onReset?: () => void
}

const DEFAULT_ERROR_MESSAGE = 'Não foi possível carregar os dados. Tente novamente.'

function DefaultErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  console.error(error)
  const isDevelopment = process.env.NODE_ENV !== 'production'
  const message = isDevelopment && error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE

  return <ErrorState message={message} onRetry={resetErrorBoundary} />
}

export function RenderBoundary({
  children,
  fallback = <LoadingState />,
  errorFallback = DefaultErrorFallback,
  onReset,
}: RenderBoundaryProps) {
  const ErrorFallbackComponent =
    typeof errorFallback === 'function' ? errorFallback : () => errorFallback

  return (
    <ErrorBoundary fallbackRender={ErrorFallbackComponent} onReset={onReset}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  )
}
