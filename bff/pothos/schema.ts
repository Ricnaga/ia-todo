import './scalars'
import './todo'
import './assistant'
import './insights'

import { builder } from '@/bff/pothos/builder'

export const schema = builder.toSchema()
