import { describe, expect, it } from 'vitest'
import { defineAbilityFor } from './index'

describe('Permissions', () => {
  it('should grant full access to system admin', () => {
    const ability = defineAbilityFor({
      id: 'admin-id',
      role: 'MEMBER',
      isSystemAdmin: true,
    })

    expect(ability.can('manage', 'all')).toBe(true)
  })

  it('should grant owner access to club management', () => {
    const ability = defineAbilityFor({
      id: 'owner-id',
      role: 'OWNER',
      isSystemAdmin: false,
    })

    expect(ability.can('update', 'Club')).toBe(true)
    expect(ability.can('transfer_ownership', 'Club')).toBe(true)
    expect(ability.can('update_roles', 'User')).toBe(true)
  })

  it('should restrict manager from transferring ownership', () => {
    const ability = defineAbilityFor({
      id: 'manager-id',
      role: 'MANAGER',
      isSystemAdmin: false,
    })

    expect(ability.can('update', 'Club')).toBe(true)
    expect(ability.cannot('transfer_ownership', 'Club')).toBe(true)
    expect(ability.cannot('update_roles', 'User')).toBe(true)
    expect(ability.cannot('delete', 'User')).toBe(true)
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

  it('should allow member to manage their own workouts', () => {
    const ability = defineAbilityFor({
      id: 'member-id',
      role: 'MEMBER',
      isSystemAdmin: false,
    })

    expect(ability.can('create', 'Workout')).toBe(true)
    expect(
      ability.can('update', 'Workout', { athleteId: 'member-id' } as any)
    ).toBe(true)
    expect(
      ability.cannot('update', 'Workout', { athleteId: 'other-id' } as any)
    ).toBe(true)
    expect(ability.cannot('prescribe', 'Workout')).toBe(true)
  })
})
