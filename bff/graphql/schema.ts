import './resolvers/todos'
import './resolvers/assistant'
import './resolvers/insights'

import { builder } from '@/bff/graphql/builder'

export const schema = builder.toSchema()
