import { prisma } from '../src/lib/prisma'

async function run() {
  const workouts = await prisma.workout.findMany({
    where: {
      status: 'COMPLETED',
    },
    include: {
      athlete: { select: { name: true } },
      club: { select: { name: true } },
    }
  })

  console.log('--- COMPLETED WORKOUTS IN DB ---')
  console.log(JSON.stringify(workouts.map(w => ({
    id: w.id,
    athlete: w.athlete.name,
    club: w.club?.name || 'No Club',
    distance: w.distance,
    date: w.date,
    status: w.status,
  })), null, 2))

  const rankings = await prisma.ranking.findMany({
    include: {
      athlete: { select: { name: true } },
    }
  })
  
  console.log('\n--- RANKINGS IN DB ---')
  console.log(JSON.stringify(rankings.map(r => ({
    athlete: r.athlete?.name || 'No Athlete',
    year: r.year,
    month: r.month,
    week: r.week,
    points: r.points,
  })), null, 2))
}

run()
