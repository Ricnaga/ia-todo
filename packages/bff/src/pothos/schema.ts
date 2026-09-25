import './scalars'
import './modules'

import { builder } from './builder'

export const schema = builder.toSchema()
