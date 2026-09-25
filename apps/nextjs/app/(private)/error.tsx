'use client'

import { ErrorState } from '@/components/error-state/error-state'

type PrivateErrorProps = {
  error: Error & { digest?: string }
  retry: () => void
}

export default function PrivateError({ error, retry }: PrivateErrorProps) {
  console.error(error.digest, error)
  return <ErrorState onRetry={retry} />
}
