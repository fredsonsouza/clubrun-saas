import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import {
  endOfISOWeek,
  endOfMonth,
  endOfYear,
  getISOWeek,
  getMonth,
  startOfISOWeek,
  startOfMonth,
  startOfYear,
} from 'date-fns'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

const rankingResponse = z.object({
  rankings: z.array(
    z.object({
      id: z.string(),
      points: z.number(),
      athleteId: z.string(),
      athlete: z.object({
        id: z.string(),
        name: z.string().nullable(),
        avatarUrl: z.string().nullable(),
      }),
      distance: z.number(),
      duration: z.number(),
      workoutsCount: z.number(),
      paceAvg: z.number(),
    })
  ),
})

export async function getClubeRanking(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/clubs/:slug/rankings',
      {
        schema: {
          tags: ['rankings'],
          summary: 'Get club ranking (weekly, monthly, or yearly)',
          security: [{ bearerAuth: [] }],
          params: z.object({ slug: z.string() }),
          querystring: z.object({
            type: z.enum(['weekly', 'monthly', 'yearly']).default('monthly'),
            year: z.coerce.number().default(new Date().getFullYear()),
            month: z.coerce.number().min(1).max(12).optional(),
            week: z.coerce.number().min(1).max(53).optional(),
          }),
          response: { 200: rankingResponse },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const { type, year, month, week } = request.query
        const { club } = await request.getUserMemberShip(slug)

        let periodType: 'WEEK' | 'MONTH' | 'YEAR'
        let periodStart: Date
        let periodEnd: Date

        if (type === 'weekly') {
          periodType = 'WEEK'
          const currentWeek = week ?? getISOWeek(new Date())
          const jan4 = new Date(year, 0, 4)
          const firstWeek = startOfISOWeek(jan4)
          periodStart = new Date(firstWeek)
          periodStart.setDate(firstWeek.getDate() + (currentWeek - 1) * 7)
          periodStart.setHours(0, 0, 0, 0)
          periodEnd = endOfISOWeek(periodStart)
        } else if (type === 'yearly') {
          periodType = 'YEAR'
          periodStart = startOfYear(new Date(year, 0, 1))
          periodEnd = endOfYear(periodStart)
        } else {
          periodType = 'MONTH'
          const currentMonth = month ?? getMonth(new Date()) + 1
          periodStart = startOfMonth(new Date(year, currentMonth - 1, 1))
          periodEnd = endOfMonth(periodStart)
        }

        const rankingsRaw = await prisma.ranking.findMany({
          where: {
            clubId: club.id,
            periodType,
            periodStart,
          },
          select: {
            id: true,
            points: true,
            athleteId: true,
            athlete: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { points: 'desc' },
        })

        const athleteIds = rankingsRaw.map((ranking) => ranking.athleteId)
        const workoutsStats =
          athleteIds.length > 0
            ? await prisma.workout.groupBy({
                by: ['athleteId'],
                where: {
                  athleteId: { in: athleteIds },
                  clubId: club.id,
                  status: 'COMPLETED',
                  date: { gte: periodStart, lte: periodEnd },
                },
                _sum: { distance: true, duration: true },
                _count: { id: true },
              })
            : []

        const statsMap = new Map(
          workoutsStats.map((stats) => [
            stats.athleteId,
            {
              distance: stats._sum.distance ?? 0,
              duration: stats._sum.duration ?? 0,
              count: stats._count.id,
            },
          ])
        )

        return reply.send({
          rankings: rankingsRaw.map((ranking) => {
            const stats = statsMap.get(ranking.athleteId) ?? {
              distance: 0,
              duration: 0,
              count: 0,
            }
            return {
              id: ranking.id,
              points: ranking.points,
              athleteId: ranking.athleteId,
              athlete: ranking.athlete,
              distance: stats.distance,
              duration: stats.duration,
              workoutsCount: stats.count,
              paceAvg:
                stats.distance > 0 ? stats.duration / 60 / stats.distance : 0,
            }
          }),
        })
      }
    )
}
