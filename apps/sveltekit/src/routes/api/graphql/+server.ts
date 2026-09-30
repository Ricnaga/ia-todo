import type { RequestHandler } from '@sveltejs/kit'
import { yoga } from '$lib/server/graphql'

/**
 * O Yoga e um fetch handler `(Request) => Response`, e um `RequestHandler` do
 * SvelteKit recebe um `RequestEvent`. O adaptador e so o desempacotar do
 * `event.request` -- mesmo formato do `toNextJsHandler` do app Next.
 */
const handle: RequestHandler = ({ request }) => yoga(request)

export const GET = handle
export const POST = handle
