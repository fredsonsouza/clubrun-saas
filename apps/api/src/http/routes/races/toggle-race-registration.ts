import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { subHours, isBefore } from 'date-fns'

export async function toggleRaceRegistration(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/clubs/:slug/races/:raceId/toggle-registration',
      {
        schema: {
          tags: ['races'],
          summary: 'Toggle race registration',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            raceId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              isRegistered: z.boolean(),
              message: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug, raceId } = request.params
        const userId = await request.getCurrentUserId()
        const { club } = await request.getUserMemberShip(slug)

        const race = await prisma.race.findUnique({
          where: {
            id: raceId,
            clubId: club.id,
          },
        })

        if (!race) {
          throw new BadRequestError('Race not found')
        }

        // Rule 1: Registration/Unregistration allowed until 1 hour before start
        const limitTime = subHours(new Date(race.date), 1)
        if (isBefore(limitTime, new Date())) {
          throw new BadRequestError('As inscrições encerram 1 hora antes da largada.')
        }

        const registration = await prisma.raceParticipant.findUnique({
          where: {
            raceId_athleteId: {
              raceId,
              athleteId: userId,
            },
          },
        })

        if (registration) {
          // Unregister
          await prisma.raceParticipant.delete({
            where: {
              id: registration.id,
            },
          })

          return reply.status(200).send({
            isRegistered: false,
            message: 'Inscrição cancelada com sucesso.',
          })
        } else {
          // Rule 2: Cannot register for two races at the same date and time
          const conflictingRace = await prisma.raceParticipant.findFirst({
            where: {
              athleteId: userId,
              race: {
                date: race.date,
              },
            },
            include: {
              race: true,
            },
          })

          if (conflictingRace) {
            throw new BadRequestError(
              `Você já está inscrito na corrida "${conflictingRace.race.name}" no mesmo horário.`
            )
          }

          // Register
          await prisma.raceParticipant.create({
            data: {
              raceId,
              athleteId: userId,
            },
          })

          return reply.status(200).send({
            isRegistered: true,
            message: 'Inscrição realizada com sucesso!',
          })
        }
      }
    )
}
