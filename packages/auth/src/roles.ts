import z from 'zod'
export const roleSchema = z.enum([
  'OWNER',
  'MANAGER',
  'ADMIN',
  'ATHLETE',
  'COACH',
  'BILLING',
  'VISITOR',
])

export type Role = z.infer<typeof roleSchema>
