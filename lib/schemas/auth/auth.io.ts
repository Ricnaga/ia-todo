import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  image: z.string().url().nullish(),
})

export type UpdateProfileInput = z.input<typeof updateProfileSchema>
export type UpdateProfileOutput = z.infer<typeof updateProfileSchema>

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
})

export type ChangePasswordInput = z.input<typeof changePasswordSchema>
export type ChangePasswordOutput = z.infer<typeof changePasswordSchema>

export const changeEmailSchema = z.object({
  newEmail: z.email(),
  callbackURL: z.string().url().optional(),
})

export type ChangeEmailInput = z.input<typeof changeEmailSchema>
export type ChangeEmailOutput = z.infer<typeof changeEmailSchema>

export const linkAccountSchema = z.object({
  provider: z.enum(['google', 'github']),
  callbackURL: z.string().url().optional(),
})

export type LinkAccountInput = z.input<typeof linkAccountSchema>
export type LinkAccountOutput = z.infer<typeof linkAccountSchema>

export const unlinkAccountSchema = z.object({
  accountId: z.string().min(1),
})

export type UnlinkAccountInput = z.input<typeof unlinkAccountSchema>
export type UnlinkAccountOutput = z.infer<typeof unlinkAccountSchema>

export const revokeSessionSchema = z.object({
  token: z.string().min(1),
})

export type RevokeSessionInput = z.input<typeof revokeSessionSchema>
export type RevokeSessionOutput = z.infer<typeof revokeSessionSchema>
