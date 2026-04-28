import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { endOfMonth, startOfMonth } from 'date-fns'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export async function getClubDashBoard(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/clubs/:slug/dashboard',
      {
        schema: {
          tags: ['clubs'],
          summary: 'Get club overview dashboard metrics',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              metrics: z.object({
                activeMembers: z.number(),
                inactiveMembers: z.number(),
                pendingInvites: z.number(),
                totalDistanceMonth: z.number(),
                totalWorkoutsMonth: z.number(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const { club } = await request.getUserMemberShip(slug)

        const now = new Date()
        const monthStart = startOfMonth(now)
        const monthEnd = endOfMonth(now)

        const [activeCount, inactiveCount, invitesCount, workoutsMetrics] =
          await Promise.all([
            prisma.member.count({
              where: { clubId: club.id, status: 'ACTIVE' },
            }),
            prisma.member.count({
              where: { clubId: club.id, status: 'INACTIVE' },
            }),
            prisma.invite.count({ where: { clubId: club.id } }),
            prisma.workout.aggregate({
              where: {
                clubId: club.id,
                date: { gte: monthStart, lte: monthEnd },
              },
              _sum: { distance: true },
              _count: { id: true },
            }),
          ])

        return reply.send({
          metrics: {
            activeMembers: activeCount,
            inactiveMembers: inactiveCount,
            pendingInvites: invitesCount,
            totalDistanceMonth: Number(workoutsMetrics._sum.distance || 0),
            totalWorkoutsMonth: workoutsMetrics._count.id,
          },
        })
      }
    )
}
