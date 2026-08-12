import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { debitShoesOnce } from '@/services/shoes-mileage-ledger'
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
            time: z.number().int().positive(),
            position: z.number().int().positive().nullish(),
          }),
          params: z.object({ slug: z.string(), raceId: z.string().uuid() }),
          response: { 201: z.object({ resultId: z.string().uuid() }) },
        },
      },
      async (request, reply) => {
        const { slug, raceId } = request.params
        const userId = await request.getCurrentUserId()
        const { club } = await request.getUserMemberShip(slug)
        const race = await prisma.race.findFirst({
          where: { id: raceId, clubId: club.id },
        })
        if (!race) throw new BadRequestError('Race not found in this club.')

        const participant = await prisma.raceParticipant.findUnique({
          where: { raceId_athleteId: { raceId, athleteId: userId } },
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
        const pace = time / 60 / race.distance

        const result = await prisma.$transaction(
          async (tx) => {
            const existingResult = await tx.raceResult.findUnique({
              where: { raceId_athleteId: { raceId, athleteId: userId } },
            })
            let shoesUsed: string | null = existingResult?.shoesUsed ?? null

            if (!existingResult) {
              const athleteProfile = await tx.athleteProfile.findUnique({
                where: { userId },
                select: { shoes: true, shoesRemainingDistance: true },
              })
              shoesUsed = athleteProfile?.shoes ?? null
              if (
                shoesUsed &&
                athleteProfile?.shoesRemainingDistance !== null &&
                athleteProfile?.shoesRemainingDistance !== undefined &&
                athleteProfile.shoesRemainingDistance < race.distance
              ) {
                throw new BadRequestError(
                  `O resultado da corrida excede a vida útil restante do seu tênis (${athleteProfile.shoesRemainingDistance.toFixed(1)} km).`
                )
              }
            }

            const savedResult = await tx.raceResult.upsert({
              where: { raceId_athleteId: { raceId, athleteId: userId } },
              update: { time, position, pace },
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
              try {
                await debitShoesOnce(tx, {
                  athleteId: userId,
                  sourceType: 'RACE_RESULT',
                  sourceId: savedResult.id,
                  distanceKm: race.distance,
                })
              } catch {
                throw new BadRequestError(
                  'Quilometragem de tênis insuficiente.'
                )
              }
            }

            return savedResult
          },
          { isolationLevel: 'Serializable' }
        )

        return reply.status(201).send({ resultId: result.id })
      }
    )
}
