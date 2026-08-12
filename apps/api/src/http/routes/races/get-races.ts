import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export async function getRaces(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/clubs/:slug/races',
      {
        schema: {
          tags: ['races'],
          summary: 'Get club races',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              races: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                  distance: z.number(),
                  city: z.string(),
                  date: z.date(),
                  imageUrl: z.string().url().nullable(),
                  isRegistered: z.boolean(),
                  participants: z.array(
                    z.object({
                      athlete: z.object({
                        id: z.string().uuid(),
                        avatarUrl: z.string().url().nullable(),
                      }),
                    })
                  ),
                  _count: z.object({
                    results: z.number(),
                    participants: z.number(),
                  }),
                })
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const userId = await request.getCurrentUserId()
        const { club } = await request.getUserMemberShip(slug)

        const races = await prisma.race.findMany({
          where: {
            clubId: club.id,
          },
          include: {
            participants: {
              take: 5,
              select: {
                athlete: {
                  select: {
                    id: true,
                    avatarUrl: true,
                  },
                },
              },
            },
            _count: {
              select: {
                results: true,
                participants: true,
              },
            },
          },
          orderBy: {
            date: 'asc',
          },
        })

        // Check if user is registered for each race
        const registeredRaceIds = new Set(
          (races.length > 0
            ? await prisma.raceParticipant.findMany({
                where: {
                  athleteId: userId,
                  raceId: { in: races.map((race) => race.id) },
                },
                select: { raceId: true },
              })
            : []
          ).map((participant) => participant.raceId)
        )

        const racesWithRegistration = races.map((race) => ({
          ...race,
          isRegistered: registeredRaceIds.has(race.id),
        }))

        return reply.status(200).send({ races: racesWithRegistration })
      }
    )
}
