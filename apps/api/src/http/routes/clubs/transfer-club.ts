import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { clubSchema } from '@saas/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { ForbiddenError } from '../_errors/forbidden-error'

export async function transferClub(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/clubs/:slug/owner',
      {
        schema: {
          tags: ['clubs'],
          summary: 'Transfer club ownership',
          security: [{ bearerAuth: [] }],
          body: z.object({
            transferToUserId: z.uuid(),
            leaveAfterTransfer: z.boolean().default(false),
          }),
          params: z.object({
            slug: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const userId = await request.getCurrentUserId()
        const { club, memberShip } = await request.getUserMemberShip(slug)

        if (club.ownerId !== userId) {
          throw new ForbiddenError(
            'Only the current club owner can transfer ownership.'
          )
        }

        if (club.status === 'DEACTIVATED') {
          throw new ForbiddenError(
            'This club is deactivated and cannot transfer ownership.'
          )
        }

        const authClub = clubSchema.parse(club)

        const { cannot } = getUserPermissions(
          userId,
          memberShip.role,
          memberShip.isSystemAdmin,
          memberShip.clubId,
          club.ownerId
        )

        if (cannot('transfer_ownership', authClub)) {
          throw new ForbiddenError(
            `You're not allowed to transfer this club ownership`
          )
        }

        const { transferToUserId, leaveAfterTransfer } = request.body

        if (transferToUserId === userId) {
          throw new BadRequestError(
            'Club ownership is already assigned to this user'
          )
        }

        const transferToMembership = await prisma.member.findUnique({
          where: {
            clubId_userId: {
              clubId: club.id,
              userId: transferToUserId,
            },
          },
        })

        if (!transferToMembership || transferToMembership.status !== 'ACTIVE') {
          throw new BadRequestError(
            'Target user must be an active member of this club'
          )
        }

        await prisma.$transaction(async (tx) => {
          // 1. Promover o novo dono
          await tx.member.update({
            where: {
              clubId_userId: {
                clubId: club.id,
                userId: transferToUserId,
              },
            },
            data: {
              role: 'OWNER',
            },
          })

          // 2. Lidar com o antigo dono
          if (leaveAfterTransfer) {
            await tx.member.delete({
              where: {
                clubId_userId: {
                  clubId: club.id,
                  userId,
                },
              },
            })
          } else {
            // Rebaixar para ATHLETE
            await tx.member.update({
              where: {
                clubId_userId: {
                  clubId: club.id,
                  userId,
                },
              },
              data: {
                role: 'ATHLETE',
              },
            })
          }

          // 3. Atualizar o dono no registro do clube e limpar dados de faturamento
          await tx.club.update({
            where: {
              id: club.id,
            },
            data: {
              ownerId: transferToUserId,
              stripeCustomerId: null,
              stripeSubscriptionId: null,
              subscriptionStatus: 'PENDING_UPDATE',
            },
          })

          // 4. Registrar no AuditLog
          await tx.auditLog.create({
            data: {
              action: 'TRANSFER_OWNERSHIP',
              entity: 'CLUB',
              entityId: club.id,
              userId,
              payload: {
                from: userId,
                to: transferToUserId,
                leftClub: leaveAfterTransfer,
              },
            },
          })
        })

        return reply.status(204).send(null)
      }
    )
}
