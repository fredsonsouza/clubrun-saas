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
    can('get', ['Club', 'User', 'AthleteProfile'])
    can('manage', ['Workout', 'Race', 'RaceResult', 'Ranking', 'Invite', 'Billing', 'Invoice'])
    
    can('update', 'Club')
    can('delete', 'Club')
    can('transfer_ownership', 'Club')
    can('update_roles', 'User')
    can('delete', 'User') // Removing members
  },

  MANAGER(_, { can, cannot }) {
    can('get', ['Club', 'User', 'AthleteProfile'])
    
    can(['create', 'update', 'delete'], ['Workout', 'Race', 'RaceResult'])
    can(['get', 'update'], 'Ranking')
    can('manage', ['Invite', 'Billing', 'Invoice'])

    can('update', 'Club')
    
    // Restrictions
    cannot('transfer_ownership', 'Club')
    cannot('update_roles', 'User')
    cannot('delete', 'User') // Cannot remove members
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

    // Coach can prescribe workouts to anyone in the club
    can('prescribe', 'Workout')
    
    // Coach can manage their own workouts
    can(['create', 'update', 'delete'], 'Workout', { athleteId: { $eq: user.id } })
    
    // Coach can see all club workouts
    if (user.currentClubId) {
      can('get', 'Workout', {
        clubId: { $eq: user.currentClubId },
      })
    }

    can(['get'], 'Race')
    can(['create', 'update'], 'RaceResult')
    can('get', 'Ranking')
  },

  BILLING(user, { can, cannot }) {
    // Basic member permissions
    can('get', ['Club', 'User', 'AthleteProfile'])
    can('get', ['Race', 'RaceResult', 'Ranking'])

    // Billing specific
    can('manage', ['Billing', 'Invoice'])

    // Restrictions
    cannot(['create', 'update', 'delete'], 'Workout')
  },
}
