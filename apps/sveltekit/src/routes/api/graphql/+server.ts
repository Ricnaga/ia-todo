import type { RequestHandler } from '@sveltejs/kit'
import { yoga } from '$lib/server/graphql'

const handle: RequestHandler = ({ request }) => yoga(request)

export const GET = handle
export const POST = handle
