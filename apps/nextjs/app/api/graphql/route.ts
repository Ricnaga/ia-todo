import { createGraphQLHandler } from '@ia-task-manager/bff'

const handler = createGraphQLHandler()

function isClientAbort(error: unknown): boolean {
  return error instanceof Error && (error.name === 'ResponseAborted' || error.name === 'AbortError')
}

async function run(request: Request): Promise<Response> {
  try {
    return await handler(request)
  } catch (error) {
    if (isClientAbort(error)) return new Response(null, { status: 499 })
    throw error
  }
}

export function GET(request: Request) {
  return run(request)
}

export function POST(request: Request) {
  return run(request)
}
