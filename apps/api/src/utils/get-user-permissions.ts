import { defineAbilityFor, type Role, userSchema } from '@saas/auth'

export function getUserPermissions(
  userId: string, 
  role: Role, 
  isSystemAdmin: boolean = false,
  currentClubId?: string | null
) {
  const authUser = userSchema.parse({
    id: userId,
    role,
    isSystemAdmin,
    currentClubId,
  })

  const ability = defineAbilityFor(authUser)

  return ability
}
