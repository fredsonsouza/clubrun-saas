import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export async function connectStrava(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/users/strava/connect',
      {
        schema: {
          tags: ['users'],
          summary: 'Connect user account with mock Strava tokens',
          security: [{ bearerAuth: [] }],
          body: z.object({
            code: z.string().optional(),
          }),
          response: {
            200: z.object({
              isStravaConnected: z.boolean(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        await prisma.athleteProfile.upsert({
          where: { userId },
          create: {
            userId,
            stravaAthleteId: 'strava-athlete-123',
            stravaAccessToken: 'mock-access-token-123',
            stravaRefreshToken: 'mock-refresh-token-123',
            stravaTokenExpiresAt: new Date(Date.now() + 3600 * 1000),
            birthDate: new Date('2000-01-01'),
          },
          update: {
            stravaAthleteId: 'strava-athlete-123',
            stravaAccessToken: 'mock-access-token-123',
            stravaRefreshToken: 'mock-refresh-token-123',
            stravaTokenExpiresAt: new Date(Date.now() + 3600 * 1000),
          },
        })

        return reply.status(200).send({ isStravaConnected: true })
      }
    )
}
