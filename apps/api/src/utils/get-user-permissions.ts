import { type Role, defineAbilityFor, userSchema } from '@saas/auth'

export function getUserPermissions(
  userId: string,
  role: Role,
  isSystemAdmin = false,
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
