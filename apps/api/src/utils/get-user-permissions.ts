import { defineAbilityFor, type Role, userSchema } from '@saas/auth'

export function getUserPermissions(userId: string, role: Role, isSystemAdmin: boolean = false) {
  const authUser = userSchema.parse({
    id: userId,
    role,
    isSystemAdmin,
  })

  const ability = defineAbilityFor(authUser)

  return ability
}
