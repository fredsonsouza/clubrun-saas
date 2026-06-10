import { prisma } from '../src/lib/prisma'
import { getISOWeek, getMonth, getYear } from 'date-fns'

async function test() {
  const slug = 'corre-macuxi'
  const type = 'monthly'
  const year = 2026
  const month = 6
  const week = undefined

  const club = await prisma.club.findUnique({
    where: { slug }
  })

  if (!club) {
    console.error('Club not found')
    return
  }

  const whereClause: any = {
    clubId: club.id,
    year,
    month: null,
    week: null,
  }

  let startDate: Date
  let endDate: Date

  switch (type) {
    case 'weekly': {
      const currentWeek = week ?? getISOWeek(new Date())
      whereClause.week = currentWeek
      whereClause.month = undefined

      const jan4 = new Date(year, 0, 4)
      const dayOfJan4 = jan4.getDay() || 7
      const startOfFirstWeek = new Date(jan4.getTime() - (dayOfJan4 - 1) * 24 * 3600 * 1000)
      
      startDate = new Date(startOfFirstWeek.getTime() + (currentWeek - 1) * 7 * 24 * 3600 * 1000)
      startDate.setHours(0, 0, 0, 0)
      
      endDate = new Date(startDate.getTime() + 7 * 24 * 3600 * 1000)
      break
    }
    case 'monthly': {
      const currentMonth = month ?? getMonth(new Date()) + 1
      whereClause.month = currentMonth

      startDate = new Date(year, currentMonth - 1, 1, 0, 0, 0, 0)
      endDate = new Date(year, currentMonth, 1, 0, 0, 0, 0)
      break
    }
    case 'yearly': {
      startDate = new Date(year, 0, 1, 0, 0, 0, 0)
      endDate = new Date(year + 1, 0, 1, 0, 0, 0, 0)
      break
    }
  }

  console.log('whereClause:', whereClause)
  console.log('startDate:', startDate)
  console.log('endDate:', endDate)

  const rankingsRaw = await prisma.ranking.findMany({
    where: whereClause,
    include: {
      athlete: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      points: 'desc',
    },
  })

  console.log('rankingsRaw size:', rankingsRaw.length)
  console.log('rankingsRaw data:', JSON.stringify(rankingsRaw, null, 2))

  const athleteIds = rankingsRaw.map((r) => r.athleteId)

  const workoutsStats = athleteIds.length > 0 ? await prisma.workout.groupBy({
    by: ['athleteId'],
    where: {
      athleteId: { in: athleteIds },
      clubId: club.id,
      status: 'COMPLETED',
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
    _sum: {
      distance: true,
      duration: true,
    },
    _count: {
      id: true,
    },
  }) : []

  console.log('workoutsStats size:', workoutsStats.length)
  console.log('workoutsStats data:', JSON.stringify(workoutsStats, null, 2))

  const statsMap = new Map<string, { distance: number; duration: number; count: number }>()
  workoutsStats.forEach((ws) => {
    statsMap.set(ws.athleteId, {
      distance: ws._sum.distance || 0,
      duration: ws._sum.duration || 0,
      count: ws._count.id || 0,
    })
  })

  const rankings = rankingsRaw.map((r) => {
    const stats = statsMap.get(r.athleteId) || { distance: 0, duration: 0, count: 0 }
    const paceAvg = stats.distance > 0 ? (stats.duration / 60) / stats.distance : 0

    return {
      ...r,
      distance: stats.distance,
      duration: stats.duration,
      workoutsCount: stats.count,
      paceAvg,
    }
  })

  console.log('Final rankings result size:', rankings.length)
  console.log('Final rankings data:', JSON.stringify(rankings, null, 2))
}

test()
