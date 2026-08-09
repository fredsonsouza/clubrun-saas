import z from 'zod'
export const persistedRoleSchema = z.enum([
  'OWNER',
  'MANAGER',
  'ADMIN',
  'ATHLETE',
  'COACH',
  'BILLING',
])

export const roleSchema = persistedRoleSchema.or(z.literal('VISITOR'))

export type PersistedRole = z.infer<typeof persistedRoleSchema>
export type Role = z.infer<typeof roleSchema>
