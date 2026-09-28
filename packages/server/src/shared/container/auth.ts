import { prisma } from '../../db/prisma'
import { auth } from '../../modules/auth/infra/better-auth'
import { PrismaSessionTokenRepository } from '../../modules/auth/infra/prisma-session-token.repository'
import { AuthUseCase } from '../../modules/auth/use-cases/auth.use-case'
import type { IAuthUseCase } from '../../modules/auth/use-cases/auth.use-case.interface'
import { AuthController } from '../../modules/auth/controllers/auth.controller'
import { oauthService } from './infra'

const sessionTokenRepository = new PrismaSessionTokenRepository(prisma)

const authUseCase: IAuthUseCase = new AuthUseCase(auth, oauthService, sessionTokenRepository)

export const authController = new AuthController(authUseCase)

export { authUseCase }

export type { IAuthUseCase }
