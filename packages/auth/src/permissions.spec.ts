import { describe, expect, it } from 'vitest'
import { defineAbilityFor, persistedRoleSchema, roleSchema } from './index'

type TenantCase = {
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'COACH' | 'BILLING' | 'ATHLETE'
  action: string
  type: string
  attributes?: Record<string, unknown>
}

const clubId = 'club-a'
const otherClubId = 'club-b'
const userId = 'user-a'

function resource(type: string, attributes: Record<string, unknown>) {
  return { __typename: type, ...attributes }
}

function abilityFor(role: TenantCase['role']) {
  return defineAbilityFor({
    id: userId,
    role,
    isSystemAdmin: false,
    currentClubId: clubId,
  })
}

const tenantCases: TenantCase[] = [
  { role: 'OWNER', action: 'update', type: 'Race' },
  { role: 'ADMIN', action: 'delete', type: 'User' },
  { role: 'MANAGER', action: 'prescribe', type: 'Workout' },
  { role: 'COACH', action: 'prescribe', type: 'Workout' },
  { role: 'BILLING', action: 'update', type: 'Billing' },
  {
    role: 'ATHLETE',
    action: 'update',
    type: 'Workout',
    attributes: { athleteId: userId },
  },
]

describe('tenant-scoped permissions', () => {
  it('grants unrestricted access only to system administrators', () => {
    const systemAbility = defineAbilityFor({
      id: 'system-admin',
      role: 'ATHLETE',
      isSystemAdmin: true,
    })
    const clubAdminAbility = abilityFor('ADMIN')

    expect(systemAbility.can('manage', 'all')).toBe(true)
    expect(clubAdminAbility.can('manage', 'all')).toBe(false)
  })

  it.each(tenantCases)(
    'scopes $role $action $type to the current club',
    ({ role, action, type, attributes = {} }) => {
      const ability = abilityFor(role)
      const currentTenantSubject = resource(type, {
        id: `${type}-a`,
        clubId,
        ...attributes,
      })
      const otherTenantSubject = resource(type, {
        id: `${type}-b`,
        clubId: otherClubId,
        ...attributes,
      })

      expect(ability.can(action as never, currentTenantSubject as never)).toBe(
        true
      )
      expect(ability.can(action as never, otherTenantSubject as never)).toBe(
        false
      )
    }
  )

  it('fails closed for an internal role without currentClubId', () => {
    const ability = defineAbilityFor({
      id: userId,
      role: 'OWNER',
      isSystemAdmin: false,
    })

    expect(
      ability.can(
        'get',
        resource('Club', { id: clubId, ownerId: userId }) as never
      )
    ).toBe(false)
  })

  it('grants ownership actions only in the owned current club', () => {
    const ability = abilityFor('OWNER')

    expect(
      ability.can(
        'transfer_ownership',
        resource('Club', { id: clubId, ownerId: userId }) as never
      )
    ).toBe(true)
    expect(
      ability.can(
        'transfer_ownership',
        resource('Club', { id: clubId, ownerId: 'another-owner' }) as never
      )
    ).toBe(false)
    expect(
      ability.can(
        'transfer_ownership',
        resource('Club', { id: otherClubId, ownerId: userId }) as never
      )
    ).toBe(false)
  })
})

describe('negative role/action matrix', () => {
  it.each([
    ['ADMIN', 'transfer_ownership', 'Club'],
    ['ADMIN', 'update_roles', 'User'],
    ['MANAGER', 'transfer_ownership', 'Club'],
    ['MANAGER', 'update_roles', 'User'],
    ['MANAGER', 'delete', 'User'],
    ['COACH', 'update', 'Race'],
    ['COACH', 'get', 'Billing'],
    ['COACH', 'update', 'Invoice'],
    ['BILLING', 'get', 'Workout'],
    ['BILLING', 'prescribe', 'Workout'],
    ['ATHLETE', 'prescribe', 'Workout'],
    ['ATHLETE', 'get', 'Billing'],
  ] as const)('denies %s from %s %s', (role, action, type) => {
    const ability = abilityFor(role)
    const subject =
      type === 'Club'
        ? resource('Club', { id: clubId, ownerId: userId })
        : resource(type, { id: 'resource-id', clubId, athleteId: 'other-user' })

    expect(ability.can(action as never, subject as never)).toBe(false)
  })

  it('allows MANAGER to prescribe workouts in the current club', () => {
    expect(
      abilityFor('MANAGER').can(
        'prescribe',
        resource('Workout', {
          id: 'workout-id',
          clubId,
          athleteId: 'athlete-id',
        }) as never
      )
    ).toBe(true)
  })

  it('allows athletes to mutate only their own workouts', () => {
    const ability = abilityFor('ATHLETE')

    expect(
      ability.can(
        'update',
        resource('Workout', {
          id: 'own-workout',
          clubId,
          athleteId: userId,
        }) as never
      )
    ).toBe(true)
    expect(
      ability.can(
        'update',
        resource('Workout', {
          id: 'other-workout',
          clubId,
          athleteId: 'other-user',
        }) as never
      )
    ).toBe(false)
  })

  it('keeps visitors on explicit public actions only', () => {
    const ability = defineAbilityFor({
      id: 'visitor',
      role: 'VISITOR',
      isSystemAdmin: false,
    })

    expect(
      ability.can(
        'get_public',
        resource('Workout', { visibility: 'PUBLIC' }) as never
      )
    ).toBe(true)
    expect(
      ability.can(
        'get_public',
        resource('Workout', { visibility: 'PRIVATE' }) as never
      )
    ).toBe(false)
    expect(ability.can('get', 'Workout')).toBe(false)
  })

  it('keeps VISITOR out of persisted roles', () => {
    expect(roleSchema.safeParse('VISITOR').success).toBe(true)
    expect(persistedRoleSchema.safeParse('VISITOR').success).toBe(false)
  })
})
