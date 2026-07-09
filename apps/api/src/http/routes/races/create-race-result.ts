import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
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

        // Validate if registered and payment is confirmed
        const participant = await prisma.raceParticipant.findUnique({
          where: {
            raceId_athleteId: {
              raceId,
              athleteId: userId,
            },
          },
        })

        if (!participant) {
          throw new BadRequestError(
            'Você precisa estar inscrito na corrida para registrar um resultado.'
          )
        }

        if (participant.paymentStatus !== 'CONFIRMED') {
          throw new BadRequestError(
            'Seu pagamento para esta corrida ainda não foi confirmado pelos administradores.'
          )
        }

        const { time, position } = request.body

        // Calculate pace: (time / 60) / distance
        const pace = time / 60 / race.distance

        const existingResult = await prisma.raceResult.findUnique({
          where: {
            raceId_athleteId: {
              raceId,
              athleteId: userId,
            },
          },
        })

        let shoesUsed: string | null = null
        if (!existingResult) {
          const athleteProfile = await prisma.athleteProfile.findUnique({
            where: { userId },
            select: {
              shoes: true,
              shoesRemainingDistance: true,
            },
          })

          if (athleteProfile?.shoes) {
            shoesUsed = athleteProfile.shoes
            if (
              athleteProfile.shoesRemainingDistance !== null &&
              athleteProfile.shoesRemainingDistance !== undefined
            ) {
              if (athleteProfile.shoesRemainingDistance < race.distance) {
                throw new BadRequestError(
                  `O resultado da corrida excede a vida útil restante do seu tênis (${athleteProfile.shoesRemainingDistance.toFixed(1)} km). Por favor, realize a troca do calçado.`
                )
              }
            }
          }
        }

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
            shoesUsed,
          },
        })

        if (!existingResult && shoesUsed) {
          await prisma.athleteProfile.update({
            where: { userId },
            data: {
              shoesRemainingDistance: {
                decrement: race.distance,
              },
            },
          })
        }

        return reply.status(201).send({
          resultId: result.id,
        })
      }
    )
}
