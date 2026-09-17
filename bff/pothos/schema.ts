import './scalars'
import './modules'

import { builder } from '@/bff/pothos/builder'

export const schema = builder.toSchema()
