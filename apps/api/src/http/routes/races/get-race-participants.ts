import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export async function getRaceParticipants(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/clubs/:slug/races/:raceId/participants',
      {
        schema: {
          tags: ['races'],
          summary: 'Get all participants registered for a race',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            raceId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              participants: z.array(
                z.object({
                  id: z.string().uuid(),
                  createdAt: z.date(),
                  paymentStatus: z.enum(['PENDING', 'CONFIRMED']).nullable(),
                  athlete: z.object({
                    id: z.string().uuid(),
                    name: z.string().nullable(),
                    avatarUrl: z.string().nullable(),
                  }),
                })
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug, raceId } = request.params
        const userId = await request.getCurrentUserId()
        const { club, memberShip } = await request.getUserMemberShip(slug)

        const participants = await prisma.raceParticipant.findMany({
          where: {
            raceId,
            race: {
              clubId: club.id,
            },
          },
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
            createdAt: 'asc',
          },
        })

        const isPrivileged =
          memberShip.role === 'OWNER' ||
          memberShip.role === 'ADMIN' ||
          memberShip.role === 'MANAGER'

        const formattedParticipants = participants.map((p) => {
          // Privacy check: Only admins or the athlete themselves can view paymentStatus
          const canViewPayment = isPrivileged || p.athleteId === userId

          return {
            id: p.id,
            createdAt: p.createdAt,
            paymentStatus: canViewPayment ? p.paymentStatus : null,
            athlete: p.athlete,
          }
        })

        return reply.status(200).send({ participants: formattedParticipants })
      }
    )
}
