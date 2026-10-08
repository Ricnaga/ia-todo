import { error, redirect } from '@sveltejs/kit'
import { GraphQLRequestError, UNAUTHENTICATED_CODE } from '@ia-task-manager/bff/graphql'
import { paths } from '$lib/constants/paths'
import { authQueryKeys } from '$lib/services/auth/auth.keys'
import { fetchMe } from '$lib/services/auth/auth.request'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ fetch, url, depends }) => {
  depends(authQueryKeys.me)

  let user
  try {
    user = await fetchMe(fetch)
  } catch (cause) {
    if (cause instanceof GraphQLRequestError && cause.code === UNAUTHENTICATED_CODE) {
      redirect(303, `${paths.LOGIN}?next=${encodeURIComponent(url.pathname)}`)
    }

    console.error('[private] falha ao carregar a sessão', cause)
    error(500, 'Não foi possível carregar sua sessão.')
  }

  if (!user) {
    redirect(303, `${paths.LOGIN}?next=${encodeURIComponent(url.pathname)}`)
  }

  return { user }
}
