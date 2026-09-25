import { createGraphQLHandler } from '@ia-task-manager/bff'

const handler = createGraphQLHandler()

export function GET(request: Request) {
  return handler(request)
}

export function POST(request: Request) {
  return handler(request)
}
