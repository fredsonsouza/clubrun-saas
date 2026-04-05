import z from 'zod'
import { roleSchema } from '../roles'

export const userSchema = z.object({
  id: z.string(),
  role: roleSchema,
  currentClubId: z.uuid().nullable().optional(),
})
export type User = z.infer<typeof userSchema>
