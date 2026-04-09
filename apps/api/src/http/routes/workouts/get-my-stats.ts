import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { endOfISOWeek, startOfISOWeek, subWeeks } from 'date-fns'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export async function getMyStats(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/workouts/my-stats',
      {
        schema: {
          tags: ['Workouts'],
          summary: 'Get personal running statistics and progress',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              stats: z.object({
                totalDistance: z.number(),
                avgPace: z.number().nullable(),
                totalWorkouts: z.number(),
                weeklyProgress: z.number(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const allWorkouts = await prisma.workout.findMany({
          where: { athleteId: userId },
          select: {
            distance: true,
            pace: true,
          },
        })
        const totalDistance = allWorkouts.reduce(
          (acc, w) => acc + w.distance,
          0
        )
        const workoutsWithPace = allWorkouts.filter((w) => w.pace && w.pace > 0)
        const avgPace =
          workoutsWithPace.length > 0
            ? workoutsWithPace.reduce((acc, w) => acc + (w.pace || 0), 0) /
              workoutsWithPace.length
            : null

        const now = new Date()
        const currentWeekStart = startOfISOWeek(now)
        const lastWeekStart = startOfISOWeek(subWeeks(now, 1))
        const lastWeekEnd = endOfISOWeek(subWeeks(now, 1))

        const currentWeekDistance = await prisma.workout.aggregate({
          where: {
            athleteId: userId,
            date: { gte: currentWeekStart },
          },
          _sum: { distance: true },
        })

        const lastWeekDistance = await prisma.workout.aggregate({
          where: {
            athleteId: userId,
            date: { gte: lastWeekStart, lte: lastWeekEnd },
          },
          _sum: { distance: true },
        })

        const currentDist = currentWeekDistance._sum.distance || 0
        const lastDist = lastWeekDistance._sum.distance || 0

        let weeklyProgress = 0

        if (lastDist > 0) {
          weeklyProgress = ((currentDist - lastDist) / lastDist) * 100
        } else if (currentDist > 0) {
          weeklyProgress = 100
        }

        return reply.send({
          stats: {
            totalDistance: Number(totalDistance.toFixed(2)),
            avgPace: avgPace ? Number(avgPace.toFixed(2)) : null,
            totalWorkouts: allWorkouts.length,
            weeklyProgress: Number(weeklyProgress.toFixed(1)),
          },
        })
      }
    )
}
