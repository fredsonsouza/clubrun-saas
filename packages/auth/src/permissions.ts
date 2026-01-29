import type { AbilityBuilder } from '@casl/ability'
import type { AppAbility } from '.'
import type { User } from './models/user'
import type { Role } from './roles'

type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>
) => void

export const permissions: Record<Role, PermissionsByRole> = {
  OWNER(user, { can }) {
    can('manage', 'all')

    can('update', 'Club')
    can('transfer_ownership', 'Club', { ownerId: { $eq: user.id } })
  },

  ADMIN(_, { can, cannot }) {
    can('get', ['Club', 'User', 'AthleteProfile'])

    can(['create', 'update', 'delete'], ['Workout', 'Race', 'RaceResult'])

    can(['get', 'update'], 'Ranking')

    cannot('transfer_ownership', 'Club')

    can('update', 'Club')
  },

  MEMBER(user, { can }) {
    can('get', ['Club', 'User', 'AthleteProfile'])

    can('create', 'Workout')

    can(['update', 'delete'], 'Workout', { athleteId: { $eq: user.id } })

    can('get', ['Race', 'RaceResult', 'Ranking'])
  },

  COACH(_, { can }) {
    can('get', ['Club', 'User', 'AthleteProfile'])

    can(['create', 'update'], 'Workout')

    can(['get'], 'Race')

    can(['create', 'update'], 'RaceResult')

    can('get', 'Ranking')
  },

  BILLING(_, { can }) {
    can('manage', 'Billing')
  },
}
