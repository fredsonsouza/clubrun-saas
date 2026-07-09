import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'

export async function toggleWorkoutReaction(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/clubs/:slug/workouts/:workoutId/reactions',
      {
        schema: {
          tags: ['workouts'],
          summary: 'Toggle a reaction on a workout',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            workoutId: z.string().uuid(),
          }),
          body: z.object({
            type: z.enum(['LIKE', 'FIRE', 'CLAP', 'TROPHY']),
          }),
          response: {
            200: z.object({
              currentUserReaction: z.string().nullable(),
              reactions: z.array(
                z.object({
                  type: z.string(),
                  count: z.number(),
                })
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug, workoutId } = request.params
        const { type } = request.body
        const userId = await request.getCurrentUserId()

        // Verifica se o usuário é membro do clube
        await request.getUserMemberShip(slug)

        const workout = await prisma.workout.findUnique({
          where: { id: workoutId },
        })

        if (!workout) {
          throw new BadRequestError('Workout not found')
        }

        // Busca reação existente do usuário para este treino
        const existingReaction = await prisma.workoutReaction.findUnique({
          where: {
            workoutId_userId: {
              workoutId,
              userId,
            },
          },
        })

        let nextReactionType: string | null = null

        if (existingReaction) {
          if (existingReaction.type === type) {
            // Se for igual, remove a reação
            await prisma.workoutReaction.delete({
              where: {
                id: existingReaction.id,
              },
            })
            nextReactionType = null
          } else {
            // Se for diferente, atualiza
            await prisma.workoutReaction.update({
              where: {
                id: existingReaction.id,
              },
              data: {
                type,
              },
            })
            nextReactionType = type
          }
        } else {
          // Cria nova reação
          await prisma.workoutReaction.create({
            data: {
              workoutId,
              userId,
              type,
            },
          })
          nextReactionType = type
        }

        // Busca todas as reações agrupadas para retornar a contagem atualizada
        const grouped = await prisma.workoutReaction.groupBy({
          by: ['type'],
          where: {
            workoutId,
          },
          _count: {
            id: true,
          },
        })

        const reactions = grouped.map((g) => ({
          type: g.type,
          count: g._count.id,
        }))

        return reply.send({
          currentUserReaction: nextReactionType,
          reactions,
        })
      }
    )
}
