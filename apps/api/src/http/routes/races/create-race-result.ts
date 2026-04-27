import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'

export async function createRaceResult(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/clubs/:slug/races/:raceId/results',
      {
        schema: {
          tags: ['races'],
          summary: 'Create or update a race result',
          security: [{ bearerAuth: [] }],
          body: z.object({
            time: z.number().int().positive(), // in seconds
            position: z.number().int().positive().nullish(),
          }),
          params: z.object({
            slug: z.string(),
            raceId: z.string().uuid(),
          }),
          response: {
            201: z.object({
              resultId: z.string().uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug, raceId } = request.params
        const userId = await request.getCurrentUserId()
        const { club } = await request.getUserMemberShip(slug)

        const race = await prisma.race.findFirst({
          where: {
            id: raceId,
            clubId: club.id,
          },
        })

        if (!race) {
          throw new BadRequestError('Race not found in this club.')
        }

        const { time, position } = request.body

        // Calculate pace: (time / 60) / distance
        const pace = (time / 60) / race.distance

        const result = await prisma.raceResult.upsert({
          where: {
            raceId_athleteId: {
              raceId,
              athleteId: userId,
            },
          },
          update: {
            time,
            position,
            pace,
          },
          create: {
            raceId,
            athleteId: userId,
            time,
            position,
            pace,
          },
        })

        return reply.status(201).send({
          resultId: result.id,
        })
      }
    )
}
