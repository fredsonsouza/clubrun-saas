import { MedicalAthleteDto } from '@/http/dtos'
import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/utils/audit-log'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { ForbiddenError } from '../_errors/forbidden-error'
import { ResourceNotFoundError } from '../_errors/resource-not-found-error'

export async function getUserMedicalProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/users/:userId/profile/medical',
      {
        schema: {
          tags: ['users'],
          summary: 'Get the authenticated user medical profile',
          security: [{ bearerAuth: [] }],
          params: z.object({ userId: z.uuid() }),
          response: {
            200: z.object({ medicalProfile: MedicalAthleteDto }),
          },
        },
      },
      async (request, reply) => {
        const { userId: profileUserId } = request.params
        const currentUserId = await request.getCurrentUserId()

        if (currentUserId !== profileUserId) {
          const currentUser = await prisma.user.findUnique({
            where: { id: currentUserId },
            select: { isSystemAdmin: true },
          })

          // Club staff is denied until an explicit consent model and policy exist.
          if (!currentUser?.isSystemAdmin) {
            throw new ForbiddenError('Medical profile access is restricted.')
          }
        }

        const medicalProfile = await prisma.athleteProfile.findUnique({
          where: { userId: profileUserId },
          select: {
            userId: true,
            hasMedicalConditions: true,
            medicalConditions: true,
          },
        })

        if (!medicalProfile) {
          throw new ResourceNotFoundError('Medical profile not found')
        }

        createAuditLog({
          action: 'MEDICAL_PROFILE_VIEWED',
          entity: 'ATHLETE_PROFILE',
          entityId: profileUserId,
          userId: currentUserId,
        })

        return reply.send({ medicalProfile })
      }
    )
}
