import type { PrismaClient } from '../../generated/prisma/client'

type DbClient = Pick<PrismaClient, 'shoesMileageEntry' | 'athleteProfile'>

export async function debitShoesOnce(
  db: DbClient,
  input: {
    athleteId: string
    sourceType: string
    sourceId: string
    distanceKm: number
  }
) {
  const existing = await db.shoesMileageEntry.findUnique({
    where: {
      sourceType_sourceId: {
        sourceType: input.sourceType,
        sourceId: input.sourceId,
      },
    },
  })
  if (existing) return false

  const profile = await db.athleteProfile.findUnique({
    where: { userId: input.athleteId },
    select: { shoes: true },
  })
  if (!profile?.shoes) return false

  const updated = await db.athleteProfile.updateMany({
    where: {
      userId: input.athleteId,
      shoesRemainingDistance: { gte: input.distanceKm },
    },
    data: { shoesRemainingDistance: { decrement: input.distanceKm } },
  })
  if (updated.count !== 1) {
    throw new Error('Quilometragem de tênis insuficiente.')
  }

  await db.shoesMileageEntry.create({
    data: {
      athleteId: input.athleteId,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      distanceKm: input.distanceKm,
      kind: 'DEBIT',
    },
  })
  return true
}

export async function creditShoesOnce(
  db: DbClient,
  input: {
    athleteId: string
    sourceType: string
    sourceId: string
    distanceKm: number
  }
) {
  const debit = await db.shoesMileageEntry.findUnique({
    where: {
      sourceType_sourceId: {
        sourceType: input.sourceType,
        sourceId: input.sourceId,
      },
    },
  })
  if (!debit || debit.kind !== 'DEBIT') return false

  const reversalSourceId = `${input.sourceId}:reversal`
  const reversal = await db.shoesMileageEntry.findUnique({
    where: {
      sourceType_sourceId: {
        sourceType: input.sourceType,
        sourceId: reversalSourceId,
      },
    },
  })
  if (reversal) return false

  await db.athleteProfile.update({
    where: { userId: input.athleteId },
    data: { shoesRemainingDistance: { increment: input.distanceKm } },
  })
  await db.shoesMileageEntry.create({
    data: {
      athleteId: input.athleteId,
      sourceType: input.sourceType,
      sourceId: reversalSourceId,
      distanceKm: input.distanceKm,
      kind: 'CREDIT',
    },
  })
  return true
}
