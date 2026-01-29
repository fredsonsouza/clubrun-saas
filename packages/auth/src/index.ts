import {
  createMongoAbility,
  CreateAbility,
  MongoAbility,
  AbilityBuilder,
} from '@casl/ability'
import type { User } from './models/user'
import { permissions } from './permissions'
import { userSubject } from './subjects/user'
import { workoutSubject } from './subjects/workout'
import z from 'zod'
import { billingSubject } from './subjects/billing'
import { inviteSubject } from './subjects/invite'
import { clubSubject } from './subjects/club'
import { athleteprofileSubject } from './subjects/athlete-profile'
import { raceSubject } from './subjects/race'
import { raceResultSubject } from './subjects/race-result'
import { rankingSubject } from './subjects/ranking'

export * from './models/athlete-profile'
export * from './models/club'
export * from './models/race'
export * from './models/race-result'
export * from './models/ranking'
export * from './models/user'
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

  z.tuple([z.literal('manage'), z.literal('all')]),
])

type AppAbilities = z.infer<typeof appAbilitiesSchema>

export type AppAbility = MongoAbility<AppAbilities>

export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>

export function defineAbilityFor(user: User) {
  const builder = new AbilityBuilder(createAppAbility)

  if (typeof permissions[user.role] !== 'function') {
    throw new Error(`Permissions for role ${user.role} not found`)
  }

  permissions[user.role](user, builder)

  const ability = builder.build({
    detectSubjectType(subject) {
      return subject.__typename
    },
  })

  ability.can = ability.can.bind(ability)
  ability.cannot = ability.cannot.bind(ability)

  return ability
}
