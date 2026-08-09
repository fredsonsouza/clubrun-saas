import { describe, expect, it } from 'vitest'
import {
  clubSchema,
  defineAbilityFor,
  persistedRoleSchema,
  roleSchema,
  workoutSchema,
} from './index'

describe('Permissions', () => {
  it('should grant full access to system admin', () => {
    const ability = defineAbilityFor({
      id: 'admin-id',
      role: 'ATHLETE',
      isSystemAdmin: true,
    })

    expect(ability.can('manage', 'all')).toBe(true)
  })

  it('should grant ownership actions only for the real club owner', () => {
    const ability = defineAbilityFor({
      id: 'owner-id',
      role: 'OWNER',
      isSystemAdmin: false,
    })
    const ownedClub = clubSchema.parse({
      id: 'club-id',
      ownerId: 'owner-id',
    })
    const otherClub = clubSchema.parse({
      id: 'other-club-id',
      ownerId: 'other-owner-id',
    })

    expect(ability.can('update', 'Club')).toBe(true)
    expect(ability.can('transfer_ownership', ownedClub)).toBe(true)
    expect(ability.cannot('transfer_ownership', otherClub)).toBe(true)
    expect(ability.can('update_roles', 'User')).toBe(true)
  })

  it('should restrict manager from ownership and role management', () => {
    const ability = defineAbilityFor({
      id: 'manager-id',
      role: 'MANAGER',
      isSystemAdmin: false,
    })

    expect(ability.cannot('update', 'Club')).toBe(true)
    expect(ability.cannot('transfer_ownership', 'Club')).toBe(true)
    expect(ability.cannot('update_roles', 'User')).toBe(true)
    expect(ability.cannot('delete', 'User')).toBe(true)
  })

  it('should restrict admin from ownership and role management', () => {
    const ability = defineAbilityFor({
      id: 'admin-id',
      role: 'ADMIN',
      isSystemAdmin: false,
    })

    expect(ability.can('manage', 'Workout')).toBe(true)
    expect(ability.can('manage', 'Invoice')).toBe(true)
    expect(ability.cannot('transfer_ownership', 'Club')).toBe(true)
    expect(ability.cannot('update_roles', 'User')).toBe(true)
  })

  it('should allow coach to prescribe workouts', () => {
    const ability = defineAbilityFor({
      id: 'coach-id',
      role: 'COACH',
      isSystemAdmin: false,
    })

    expect(ability.can('prescribe', 'Workout')).toBe(true)
    expect(ability.can('create', 'Workout')).toBe(true)
  })

  it('should allow billing to manage billing', () => {
    const ability = defineAbilityFor({
      id: 'billing-id',
      role: 'BILLING',
      isSystemAdmin: false,
    })

    expect(ability.can('manage', 'Billing')).toBe(true)
    expect(ability.can('manage', 'Invoice')).toBe(true)
  })

  it('should allow athlete to manage their own workouts', () => {
    const ability = defineAbilityFor({
      id: 'member-id',
      role: 'ATHLETE',
      isSystemAdmin: false,
    })

    const ownWorkout = workoutSchema.parse({
      id: 'workout-id',
      athleteId: 'member-id',
      clubId: 'club-id',
      visibility: 'PRIVATE',
    })
    const otherWorkout = workoutSchema.parse({
      id: 'other-workout-id',
      athleteId: 'other-id',
      clubId: 'club-id',
      visibility: 'PUBLIC',
    })

    expect(ability.can('create', 'Workout')).toBe(true)
    expect(ability.can('update', ownWorkout)).toBe(true)
    expect(ability.cannot('update', otherWorkout)).toBe(true)
    expect(ability.cannot('prescribe', 'Workout')).toBe(true)
  })

  it('should keep VISITOR out of persisted roles', () => {
    expect(roleSchema.safeParse('VISITOR').success).toBe(true)
    expect(persistedRoleSchema.safeParse('VISITOR').success).toBe(false)
    expect(persistedRoleSchema.safeParse('ATHLETE').success).toBe(true)
  })
})
