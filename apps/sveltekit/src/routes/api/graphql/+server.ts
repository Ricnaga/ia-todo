import type { RequestHandler } from '@sveltejs/kit'
import { yoga } from '$lib/server/graphql'

function isClientAbort(error: unknown): boolean {
  return error instanceof Error && (error.name === 'ResponseAborted' || error.name === 'AbortError')
}

const handle: RequestHandler = async ({ request }) => {
  try {
    return await yoga(request)
  } catch (error) {
    if (isClientAbort(error)) return new Response(null, { status: 499 })
    throw error
  }
}

export const GET = handle
export const POST = handle
