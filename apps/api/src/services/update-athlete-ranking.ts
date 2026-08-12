import {
  endOfISOWeek,
  endOfMonth,
  endOfYear,
  startOfISOWeek,
  startOfMonth,
  startOfYear,
} from 'date-fns'

import type { PrismaClient } from '../../generated/prisma/client'

interface RankingPeriod {
  type: 'WEEK' | 'MONTH' | 'YEAR'
  startDate: Date
  endDate: Date
}

type DbClient = Pick<PrismaClient, 'workout' | 'ranking'>

export async function updateAthleteRanking(
  db: DbClient,
  athleteId: string,
  clubId: string,
  referenceDate: Date
) {
  const periods: RankingPeriod[] = [
    {
      type: 'WEEK',
      startDate: startOfISOWeek(referenceDate),
      endDate: endOfISOWeek(referenceDate),
    },
    {
      type: 'MONTH',
      startDate: startOfMonth(referenceDate),
      endDate: endOfMonth(referenceDate),
    },
    {
      type: 'YEAR',
      startDate: startOfYear(referenceDate),
      endDate: endOfYear(referenceDate),
    },
  ]

  for (const period of periods) {
    const workouts = await db.workout.findMany({
      where: {
        athleteId,
        clubId,
        status: 'COMPLETED',
        date: { gte: period.startDate, lte: period.endDate },
      },
      select: { distance: true, pace: true },
    })

    const totalPoints = workouts.reduce((points, workout) => {
      const distancePoints = workout.distance * 10
      const speedKmH = workout.pace && workout.pace > 0 ? 60 / workout.pace : 0
      return points + Math.round(distancePoints + speedKmH * 5)
    }, 0)

    await db.ranking.upsert({
      where: {
        clubId_athleteId_periodType_periodStart: {
          clubId,
          athleteId,
          periodType: period.type,
          periodStart: period.startDate,
        },
      },
      create: {
        clubId,
        athleteId,
        periodType: period.type,
        periodStart: period.startDate,
        points: totalPoints,
      },
      update: { points: totalPoints },
    })
  }
}

export async function updateAthletePaceAverage(
  db: Pick<PrismaClient, 'workout' | 'athleteProfile'>,
  athleteId: string,
  clubId: string
) {
  const athleteStats = await db.workout.aggregate({
    where: { athleteId, clubId, status: 'COMPLETED' },
    _sum: { distance: true, duration: true },
  })

  const totalDistance = athleteStats._sum.distance ?? 0
  const totalSeconds = athleteStats._sum.duration ?? 0
  const paceAvg = totalDistance > 0 ? totalSeconds / 60 / totalDistance : null

  await db.athleteProfile.upsert({
    where: { userId: athleteId },
    create: { userId: athleteId, paceAvg },
    update: { paceAvg },
  })
}
