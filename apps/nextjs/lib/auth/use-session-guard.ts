'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useQueryClient, type Query } from '@tanstack/react-query'
import { paths } from '@/lib/constants/router-paths'
import { GraphQLRequestError, UNAUTHENTICATED_CODE } from '@/services/graphql/base'
import { authQueryKeys } from '@/services/auth/auth.keys'

const ME_KEY = authQueryKeys.me[0]

/**
 * O cache e heterogeneo -- tem queries de todo tipo -- mas estes dois guards nao
 * leem dado nenhum: um compara com `null` e o outro testa `instanceof`. Por isso
 * o `Query` sem parametros, que e o que o `subscribe` da `QueryCache` entrega,
 * e nao um `Query<unknown, Error>` escrito a mao.
 */
function isMeWithoutUser(query: Query): boolean {
  return query.queryKey[0] === ME_KEY && query.state.data === null
}

function isUnauthenticated(query: Query): boolean {
  const error = query.state.error
  return error instanceof GraphQLRequestError && error.code === UNAUTHENTICATED_CODE
}

/**
 * Par cliente do `session.ts`: aquele protege a arvore privada no SSR, este
 * protege depois. Nao bloqueia render -- e uma assinatura do QueryCache que,
 * quando a sessao morre (erro com `code` UNAUTHENTICATED ou `me` resolvendo
 * null), limpa o cache e manda para `/login?next=...`.
 *
 * Fica em `lib/auth` como hook, e nao como componente em `_components`, por dois
 * motivos. O obvious: nao renderiza nada, entao e efeito puro -- a pasta
 * `_components` e do JSX. O menos obvio: o `layout.tsx` que o montava e Server
 * Component, e hook nao roda la; ele precisa de um host client. O `NavShell` e o
 * host natural -- ja e client, ja tem os tres hooks que a guarda precisa, e ja
 * e onde o logout manual faz `queryClient.clear()` + redirect. A guarda e a
 * versao automatica daquela mesma politica, entao mora do lado.
 *
 * E o `NavShell` e usado em um lugar so, o `(private)/layout.tsx`, que e o que
 * mantem a guarda no escopo privado: `useMeQuery` so e lido em tela autenticada,
 * um guard global cobriria alem do escopo real.
 */
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
