import { z } from 'zod'

export const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type AuthUser = z.infer<typeof authUserSchema>

export const authAccountSchema = z.object({
  id: z.string(),
  providerId: z.string(),
  accountId: z.string(),
  userId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type AuthAccount = z.infer<typeof authAccountSchema>

export const authSessionSchema = z.object({
  id: z.string(),
  token: z.string(),
  expiresAt: z.coerce.date(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type AuthSession = z.infer<typeof authSessionSchema>
