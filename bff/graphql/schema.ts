import './resolvers/todos'
import './resolvers/ai'

import { builder } from '@/bff/graphql/builder'

export const schema = builder.toSchema()
