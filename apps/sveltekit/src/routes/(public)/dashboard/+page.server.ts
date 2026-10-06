import { fetchMe } from '$lib/services/auth/auth.request'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch }) => {
  const user = await fetchMe(fetch)
  return { user }
}
