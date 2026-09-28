'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useQueryClient, type Query } from '@tanstack/react-query'
import { paths } from '@/lib/constants/router-paths'
import { GraphQLRequestError, UNAUTHENTICATED_CODE } from '@/services/graphql/base'
import { authQueryKeys } from '@/services/auth/auth.keys'

const ME_KEY = authQueryKeys.me[0]

function isMeWithoutUser(query: Query<unknown, Error>): boolean {
  return query.queryKey[0] === ME_KEY && query.state.data === null
}

function isUnauthenticated(query: Query<unknown, Error>): boolean {
  const error = query.state.error
  return error instanceof GraphQLRequestError && error.code === UNAUTHENTICATED_CODE
}

/**
 * Par cliente do `verifySession()`: o layout protege a arvore privada no SSR e
 * este protege depois. Nao e boundary nem bloqueia render -- e uma assinatura do
 * QueryCache que, quando a sessao morre (erro com `code` UNAUTHENTICATED ou `me`
 * resolvendo null), limpa o cache e manda para `/login?next=...`.
 *
 * Fica em `_components` do route group privado porque e dele: `useMeQuery` so e
 * lido nas telas autenticadas, entao um guard global cobriria alem do escopo real
 * e ainda precisaria ser montado aqui.
 */
export function SessionGuard() {
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

  return null
}
