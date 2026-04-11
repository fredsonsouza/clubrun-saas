import type { AbilityBuilder } from '@casl/ability'
import type { AppAbility } from '.'
import type { User } from './models/user'
import type { Role } from './roles'

type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>
) => void

export const permissions: Record<Role, PermissionsByRole> = {
  ADMIN(_, { can }) {
    can('manage', 'all')
  },
  OWNER(user, { can }) {
    can('manage', 'all')

    can('update', 'Club')
    can('transfer_ownership', 'Club', { ownerId: { $eq: user.id } })
  },

  MANAGER(_, { can, cannot }) {
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

    can('create', 'Invite')

    can('get', 'Invite', { authorId: { $eq: user.id } })

    if (user.currentClubId) {
      can('get', 'Workout', {
        clubId: { $eq: user.currentClubId },
        visibility: { $in: ['PUBLIC', 'COACH_ONLY'] },
      })
    }
  },

  COACH(user, { can }) {
    can('get', ['Club', 'User', 'AthleteProfile'])

    can(['create', 'update'], 'Workout')

    can(['get'], 'Race')

    if (user.currentClubId) {
      can('get', 'Workout', {
        clubId: { $eq: user.currentClubId },
      })
    }

    can(['create', 'update'], 'RaceResult')

    can('get', 'Ranking')
  },

  BILLING(_, { can }) {
    can('manage', 'Billing')
    can('manage', 'Invoice')
  },
}
