import z from 'zod'
import { roleSchema } from '../roles'

export const userSchema = z.object({
  id: z.string(),
  role: roleSchema,
  isSystemAdmin: z.boolean().default(false),
  currentClubId: z.string().nullable().optional(),
})
export type User = z.infer<typeof userSchema>
