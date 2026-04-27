import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getSystemStats(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/system/stats',
      {
        schema: {
          tags: ['system'],
          summary: 'Get global system statistics',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              stats: z.object({
                totalClubs: z.number(),
                totalUsers: z.number(),
                totalWorkouts: z.number(),
                totalRevenue: z.number(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        
        const user = await prisma.user.findUnique({
          where: { id: userId }
        })

        if (!user?.isSystemAdmin) {
          throw new UnauthorizedError('Only system administrators can access this.')
        }

        const [totalClubs, totalUsers, totalWorkouts] = await Promise.all([
          prisma.club.count(),
          prisma.user.count(),
          prisma.workout.count(),
        ])

        // Mock revenue for now as we don't have real stripe integration data here
        const totalRevenue = totalClubs * 149.90

        return reply.send({
          stats: {
            totalClubs,
            totalUsers,
            totalWorkouts,
            totalRevenue,
          },
        })
      }
    )
}
