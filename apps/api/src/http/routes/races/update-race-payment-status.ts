import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function updateRacePaymentStatus(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/clubs/:slug/races/:raceId/participants/:athleteId/payment',
      {
        schema: {
          tags: ['races'],
          summary: 'Update payment status of a race participant',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            raceId: z.string().uuid(),
            athleteId: z.string().uuid(),
          }),
          body: z.object({
            paymentStatus: z.enum(['PENDING', 'CONFIRMED']),
          }),
          response: {
            200: z.object({
              message: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug, raceId, athleteId } = request.params
        const userId = await request.getCurrentUserId()
        const { club, memberShip } = await request.getUserMemberShip(slug)

        // Enforce administrative check
        const isPrivileged =
          memberShip.role === 'OWNER' ||
          memberShip.role === 'ADMIN' ||
          memberShip.role === 'MANAGER'

        if (!isPrivileged) {
          throw new UnauthorizedError(
            'Você não tem permissão para gerenciar pagamentos de corrida.'
          )
        }

        const participant = await prisma.raceParticipant.findUnique({
          where: {
            raceId_athleteId: {
              raceId,
              athleteId,
            },
          },
        })

        if (!participant) {
          throw new BadRequestError(
            'Inscrição do atleta não encontrada nesta corrida.'
          )
        }

        const { paymentStatus } = request.body

        await prisma.raceParticipant.update({
          where: {
            id: participant.id,
          },
          data: {
            paymentStatus,
          },
        })

        return reply.status(200).send({
          message: 'Status de pagamento atualizado com sucesso!',
        })
      }
    )
}
