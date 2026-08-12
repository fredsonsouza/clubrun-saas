import {
  AbilityBuilder,
  type CreateAbility,
  type MongoAbility,
  createMongoAbility,
} from '@casl/ability'
import z from 'zod'
import type { User } from './models/user'
import { permissions } from './permissions'
import { athleteprofileSubject } from './subjects/athlete-profile'
import { billingSubject } from './subjects/billing'
import { clubSubject } from './subjects/club'
import { inviteSubject } from './subjects/invite'
import { invoiceSubject } from './subjects/invoice'
import { raceSubject } from './subjects/race'
import { raceResultSubject } from './subjects/race-result'
import { rankingSubject } from './subjects/ranking'
import { userSubject } from './subjects/user'
import { workoutSubject } from './subjects/workout'

export * from './models/athlete-profile'
export * from './models/club'
export * from './models/race'
export * from './models/race-result'
export * from './models/ranking'
export * from './models/user'
export * from './models/invoice'
export * from './models/invite'
export * from './models/workout'
export * from './roles'

const appAbilitiesSchema = z.union([
  workoutSubject,
  userSubject,
  billingSubject,
  inviteSubject,
  clubSubject,
  athleteprofileSubject,
  raceSubject,
  raceResultSubject,
  rankingSubject,
  invoiceSubject,
  inviteSubject,

  z.tuple([z.literal('manage'), z.literal('all')]),
])

export type AppAbilities = z.infer<typeof appAbilitiesSchema>
export type AppAction = AppAbilities[0]
export type AppSubject = AppAbilities[1]

export type AppAbility = MongoAbility<AppAbilities>

export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>

export function defineAbilityFor(user: User) {
  const builder = new AbilityBuilder(createAppAbility)

  if (user.isSystemAdmin) {
    builder.can('manage', 'all')
  } else if (typeof permissions[user.role] === 'function') {
    permissions[user.role](user, builder)
  } else {
    throw new Error(`Permissions for role ${user.role} not found`)
  }

  const ability = builder.build({
    detectSubjectType(subject) {
      return subject.__typename
    },
  })

  ability.can = ability.can.bind(ability)
  ability.cannot = ability.cannot.bind(ability)

  return ability
}
