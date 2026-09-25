import { createGraphQLHandler } from '@/bff/graphql'

const handler = createGraphQLHandler()

export function GET(request: Request) {
  return handler(request)
}

export function POST(request: Request) {
  return handler(request)
}
