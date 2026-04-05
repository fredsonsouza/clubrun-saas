import z from 'zod'
export const roleSchema = z.enum([
  'OWNER',
  'ADMIN',
  'MEMBER',
  'COACH',
  'BILLING',
])

export type Role = z.infer<typeof roleSchema>
