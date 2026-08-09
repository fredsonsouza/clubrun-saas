import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { assertSimulatedFlowAllowed } from '@/utils/simulated-flow-policy'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export async function subscribeAthlete(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/profile/athlete/subscribe',
      {
        schema: {
          tags: ['athlete'],
          summary: 'Activate athlete premium subscription',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              success: z.boolean(),
              message: z.string(),
              isPremium: z.boolean(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        assertSimulatedFlowAllowed()

        await prisma.athleteProfile.update({
          where: {
            userId,
          },
          data: {
            isPremium: true,
          },
        })

        return reply.send({
          success: true,
          message: 'Assinatura premium do atleta ativada com sucesso.',
          isPremium: true,
        })
      }
    )
}
