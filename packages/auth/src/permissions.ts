import type { AbilityBuilder } from '@casl/ability'
import type { AppAbility } from '.'
import type { User } from './models/user'
import type { Role } from './roles'

type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>
) => void

const tenantCondition = (user: User) => ({
  clubId: { $eq: user.currentClubId as string },
})

const clubCondition = (user: User) => ({
  id: { $eq: user.currentClubId as string },
})

export const permissions: Record<Role, PermissionsByRole> = {
  OWNER(user, { can }) {
    if (!user.currentClubId) return

    const tenant = tenantCondition(user)
    can('get', 'Club', clubCondition(user))
    can(['update', 'delete'], 'Club', clubCondition(user))
    can('transfer_ownership', 'Club', {
      id: { $eq: user.currentClubId },
      ownerId: { $eq: user.id },
    })
    can(['get', 'update_roles', 'delete'], 'User', tenant)
    can(['get', 'update', 'delete'], 'AthleteProfile', tenant)
    can(
      ['get', 'create', 'update', 'delete', 'prescribe', 'view_private'],
      'Workout',
      tenant
    )
    can(['get', 'create', 'update', 'delete'], 'Race', tenant)
    can(['get', 'create', 'update', 'delete'], 'RaceResult', tenant)
    can(['get', 'create', 'update', 'delete'], 'Ranking', tenant)
    can(['get', 'create', 'update', 'delete'], 'Invite', tenant)
    can(['get', 'update', 'export'], 'Billing', tenant)
    can(['get', 'create', 'update', 'delete'], 'Invoice', tenant)
  },

  ADMIN(user, { can }) {
    if (!user.currentClubId) return

    const tenant = tenantCondition(user)
    can(['get', 'update'], 'Club', clubCondition(user))
    can(['get', 'delete'], 'User', tenant)
    can(['get', 'update', 'delete'], 'AthleteProfile', tenant)
    can(
      ['get', 'create', 'update', 'delete', 'prescribe', 'view_private'],
      'Workout',
      tenant
    )
    can(['get', 'create', 'update', 'delete'], 'Race', tenant)
    can(['get', 'create', 'update', 'delete'], 'RaceResult', tenant)
    can(['get', 'create', 'update', 'delete'], 'Ranking', tenant)
    can(['get', 'create', 'update', 'delete'], 'Invite', tenant)
    can(['get', 'update', 'export'], 'Billing', tenant)
    can(['get', 'create', 'update', 'delete'], 'Invoice', tenant)
  },

  MANAGER(user, { can }) {
    if (!user.currentClubId) return

    const tenant = tenantCondition(user)
    can('get', 'Club', clubCondition(user))
    can('get', ['User', 'AthleteProfile'], tenant)
    can(
      ['get', 'create', 'update', 'delete', 'prescribe', 'view_private'],
      'Workout',
      tenant
    )
    can(['get', 'create', 'update', 'delete'], 'Race', tenant)
    can(['get', 'create', 'update', 'delete'], 'RaceResult', tenant)
    can(['get', 'create', 'update', 'delete'], 'Ranking', tenant)
    can(['get', 'create', 'update', 'delete'], 'Invite', tenant)
    can(['get', 'update', 'export'], 'Billing', tenant)
    can(['get', 'create', 'update', 'delete'], 'Invoice', tenant)
  },

  COACH(user, { can }) {
    if (!user.currentClubId) return

    const tenant = tenantCondition(user)
    can('get', 'Club', clubCondition(user))
    can('get', ['User', 'AthleteProfile'], tenant)
    can(['get', 'prescribe', 'view_private'], 'Workout', tenant)
    can(['create', 'update', 'delete', 'view_private'], 'Workout', {
      ...tenant,
      athleteId: { $eq: user.id },
    })
    can('get', ['Race', 'RaceResult', 'Ranking'], tenant)
  },

  BILLING(user, { can }) {
    if (!user.currentClubId) return

    const tenant = tenantCondition(user)
    can('get', 'Club', clubCondition(user))
    can('get', ['User', 'AthleteProfile', 'Race', 'RaceResult', 'Ranking'], tenant)
    can(['get', 'update', 'export'], 'Billing', tenant)
    can(['get', 'create', 'update', 'delete'], 'Invoice', tenant)
  },

  ATHLETE(user, { can }) {
    if (!user.currentClubId) return

    const tenant = tenantCondition(user)
    can('get', 'Club', clubCondition(user))
    can('get', ['User', 'AthleteProfile'], tenant)
    can('get', 'Workout', tenant)
    can(['create', 'update', 'delete', 'view_private'], 'Workout', {
      ...tenant,
      athleteId: { $eq: user.id },
    })
    can('get', ['Race', 'RaceResult', 'Ranking'], tenant)
  },

  VISITOR(_, { can }) {
    can('get_public', 'Club')
    can('get_public', 'Workout', { visibility: { $eq: 'PUBLIC' } })
    can('get_public', ['Race', 'RaceResult', 'Ranking'])
  },
}
