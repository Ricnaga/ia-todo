'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useQueryClient, type Query } from '@tanstack/react-query'
import { paths } from '@/lib/constants/router-paths'
import { GraphQLRequestError, UNAUTHENTICATED_CODE } from '@ia-task-manager/bff/graphql'
import { authQueryKeys } from '@/services/auth/auth.keys'

const ME_KEY = authQueryKeys.me[0]

function isMeWithoutUser(query: Query): boolean {
  return query.queryKey[0] === ME_KEY && query.state.data === null
}

function isUnauthenticated(query: Query): boolean {
  const error = query.state.error
  return error instanceof GraphQLRequestError && error.code === UNAUTHENTICATED_CODE
}

export function useSessionGuard() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const pathname = usePathname()
  const isRedirecting = useRef(false)

  useEffect(() => {
    if (isRedirecting.current) return

    return queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== 'added' && event.type !== 'updated') return

      const { query } = event
      if (!isUnauthenticated(query) && !isMeWithoutUser(query)) return

      isRedirecting.current = true
      queryClient.clear()
      router.replace(`${paths.LOGIN}?next=${encodeURIComponent(pathname)}`)
    })
  }, [queryClient, router, pathname])
}
