import { auth } from '@/server/modules/auth/infra/better-auth'
import { AuthUseCase } from '@/server/modules/auth/use-cases/auth.use-case'
import type { IAuthUseCase } from '@/server/modules/auth/use-cases/auth.use-case.interface'
import { AuthController } from '@/server/modules/auth/controllers/auth.controller'
import { oauthService } from '@/server/shared/container/infra'

const authUseCase: IAuthUseCase = new AuthUseCase(auth, oauthService)

export const authController = new AuthController(authUseCase)

export { authUseCase }

export type { IAuthUseCase }
