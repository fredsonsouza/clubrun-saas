import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export async function disconnectStrava(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/users/strava/disconnect',
      {
        schema: {
          tags: ['users'],
          summary: 'Disconnect user account from Strava',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              isStravaConnected: z.boolean(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        await prisma.athleteProfile.update({
          where: { userId },
          data: {
            stravaAthleteId: null,
            stravaAccessToken: null,
            stravaRefreshToken: null,
            stravaTokenExpiresAt: null,
          },
        })

        return reply.status(200).send({ isStravaConnected: false })
      }
    )
}
