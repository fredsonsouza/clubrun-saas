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

        let startDate: Date
        let endDate: Date

        switch (type) {
          case 'weekly': {
            const currentWeek = week ?? getISOWeek(new Date())
            whereClause.week = currentWeek
            whereClause.month = undefined // Queremos qualquer mês para esta semana

            // Calcular início (segunda-feira) e fim (domingo) exatos da semana ISO no ano específico
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

        // Obter estatísticas agregadas dos treinos concluídos em lote único (Resolve o problema de N+1)
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

        // Mapear estatísticas para acesso O(1) rápido
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

        return reply.send({ rankings })
      }
    )
}
