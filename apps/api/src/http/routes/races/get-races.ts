import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
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
        const racesWithRegistration = await Promise.all(
          races.map(async (race) => {
            const isRegistered = await prisma.raceParticipant.findUnique({
              where: {
                raceId_athleteId: {
                  raceId: race.id,
                  athleteId: userId,
                },
              },
            })

            return {
              ...race,
              isRegistered: !!isRegistered,
            }
          })
        )

        return reply.status(200).send({ races: racesWithRegistration })
      }
    )
}
