import type { RequestHandler } from '@sveltejs/kit'
import { auth } from '@ia-task-manager/server/auth'

const handle: RequestHandler = ({ request }) => auth.handler(request)

export const GET = handle
export const POST = handle
