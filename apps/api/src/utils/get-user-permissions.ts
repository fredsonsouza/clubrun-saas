import { type Role, defineAbilityFor, userSchema } from '@saas/auth'

export function getEffectiveClubRole(
  userId: string,
  role: Role,
  currentClubOwnerId?: string | null
): Role {
  if (currentClubOwnerId === userId) {
    return 'OWNER'
  }

  if (role === 'OWNER' && currentClubOwnerId) {
    return 'ATHLETE'
  }

  return role
}

export function getUserPermissions(
  userId: string,
  role: Role,
  isSystemAdmin = false,
  currentClubId?: string | null,
  currentClubOwnerId?: string | null
) {
  const effectiveRole = getEffectiveClubRole(userId, role, currentClubOwnerId)

  const authUser = userSchema.parse({
    id: userId,
    role: effectiveRole,
    isSystemAdmin,
    currentClubId,
  })

  const ability = defineAbilityFor(authUser)

  return ability
}
