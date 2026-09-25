import { auth } from '../../modules/auth/infra/better-auth'
import { AuthUseCase } from '../../modules/auth/use-cases/auth.use-case'
import type { IAuthUseCase } from '../../modules/auth/use-cases/auth.use-case.interface'
import { AuthController } from '../../modules/auth/controllers/auth.controller'
import { oauthService } from './infra'

const authUseCase: IAuthUseCase = new AuthUseCase(auth, oauthService)

export const authController = new AuthController(authUseCase)

export { authUseCase }

export type { IAuthUseCase }
