import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getISOWeek, getMonth, getYear } from 'date-fns'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { UnauthorizedError } from '../_errors/unauthorized-error'

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
          params: z.object({
            slug: z.string(),
          }),
          querystring: z.object({
            type: z.enum(['weekly', 'monthly', 'yearly']).default('monthly'),
            year: z.coerce.number().default(getYear(new Date())),
            month: z.coerce.number().min(1).max(12).optional(),
            week: z.coerce.number().min(1).max(53).optional(),
          }),
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const { type, year, month, week } = request.query
        const { club, memberShip } = await request.getUserMemberShip(slug)

        if (memberShip.role === 'VISITOR') {
          throw new UnauthorizedError('Membro não autorizado.')
        }

        const whereClause: any = {
          clubId: club.id,
          year,
          month: null, // Default
          week: null,  // Default
        }

        switch (type) {
          case 'weekly':
            whereClause.week = week ?? getISOWeek(new Date())
            whereClause.month = undefined // We want ANY month for this week
            break
          case 'monthly':
            whereClause.month = month ?? getMonth(new Date()) + 1
            break
          case 'yearly':
            // Both month and week already null
            break
        }

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

        // Enhance with real distance and workout count from workouts table
        const rankings = await Promise.all(rankingsRaw.map(async (r) => {
          const stats = await prisma.workout.aggregate({
            where: {
              athleteId: r.athlete.id,
              clubId: club.id,
              date: {
                gte: new Date(year, (month || 1) - 1, 1),
                lt: new Date(year, (month || 12), 1),
              }
            },
            _sum: {
              distance: true,
              duration: true,
            },
            _count: {
              id: true,
            }
          })

          const totalDistance = stats._sum.distance || 0
          const totalSeconds = stats._sum.duration || 0
          
          // Pace em minutos decimais: (totalSeconds / 60) / totalDistance
          const paceAvg = totalDistance > 0 ? (totalSeconds / 60) / totalDistance : 0

          return {
            ...r,
            distance: totalDistance,
            duration: totalSeconds,
            workoutsCount: stats._count.id || 0,
            paceAvg,
          }
        }))

        return reply.send({ rankings })
      }
    )
}
