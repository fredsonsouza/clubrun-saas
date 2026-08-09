import { ForbiddenError } from '@/http/routes/_errors/forbidden-error'
import { prisma } from '@/lib/prisma'

const PREMIUM_CLUB_ROLES = new Set(['OWNER', 'COACH', 'MANAGER', 'ADMIN'])

export interface PremiumEntitlementSubject {
  isSystemAdmin: boolean
  athleteProfile: { isPremium: boolean } | null
  clubsOwned: Array<{ id: string }>
  members_on: Array<{ role: string; status: string }>
}

export function hasPremiumEntitlement(
  subject: PremiumEntitlementSubject | null
): boolean {
  if (!subject) {
    return false
  }

  return (
    subject.isSystemAdmin ||
    subject.athleteProfile?.isPremium === true ||
    subject.clubsOwned.length > 0 ||
    subject.members_on.some(
      (membership) =>
        membership.status === 'ACTIVE' &&
        PREMIUM_CLUB_ROLES.has(membership.role)
    )
  )
}

export function assertPremiumEntitlement(
  subject: PremiumEntitlementSubject | null
) {
  if (!hasPremiumEntitlement(subject)) {
    throw new ForbiddenError(
      'A adesão como atleta exige uma assinatura Premium ativa.'
    )
  }
}

export async function requirePremiumEntitlement(userId: string) {
  const subject = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isSystemAdmin: true,
      athleteProfile: {
        select: { isPremium: true },
      },
      clubsOwned: {
        select: { id: true },
      },
      members_on: {
        where: { status: 'ACTIVE' },
        select: { role: true, status: true },
      },
    },
  })

  assertPremiumEntitlement(subject)
}
