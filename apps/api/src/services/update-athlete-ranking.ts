import { prisma } from '@/lib/prisma'
import {
  endOfISOWeek,
  endOfMonth,
  endOfYear,
  getISOWeek,
  getMonth,
  getYear,
  startOfISOWeek,
  startOfMonth,
  startOfYear,
} from 'date-fns'

interface RankingPeriod {
  year: number
  month: number | null
  week: number | null
  startDate: Date
  endDate: Date
}

export async function updateAthleteRanking(
  athleteId: string,
  clubId: string,
  referenceDate: Date
) {
  const year = getYear(referenceDate)
  const month = getMonth(referenceDate)
  const week = getISOWeek(referenceDate)

  const periods: RankingPeriod[] = [
    {
      year,
      month,
      week,
      startDate: startOfISOWeek(referenceDate),
      endDate: endOfISOWeek(referenceDate),
    },
    {
      year,
      month,
      week: null,
      startDate: startOfMonth(referenceDate),
      endDate: endOfMonth(referenceDate),
    },
    {
      year,
      month: null,
      week: null,
      startDate: startOfYear(referenceDate),
      endDate: endOfYear(referenceDate),
    },
  ]

  for (const period of periods) {
    const workouts = await prisma.workout.findMany({
      where: {
        athleteId,
        clubId,
        date: {
          gte: period.startDate,
          lte: period.endDate,
        },
      },
    })

    let totalPoints = 0

    workouts.forEach((workout) => {
      const distancePoints = workout.distance * 10

      const speedKmH = workout.pace && workout.pace > 0 ? 60 / workout.pace : 0
      const pacePoints = speedKmH * 5

      totalPoints += Math.round(distancePoints + pacePoints)
    })

    await prisma.ranking.upsert({
      where: {
        clubId_athleteId_year_month_week: {
          clubId,
          athleteId,
          year: period.year,
          month: period.month ?? (null as any),
          week: period.week ?? (null as any),
        },
      },
      update: { points: totalPoints },
      create: {
        clubId,
        athleteId,
        year: period.year,
        month: period.month,
        week: period.week,
        points: totalPoints,
      },
    })
  }
}
