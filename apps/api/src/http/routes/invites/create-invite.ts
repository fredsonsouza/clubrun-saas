import { getUserPermissions } from '@/utils/get-user-permissions'
import { roleSchema } from '@saas/auth'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { BadRequestError } from '../_errors/bad-request-error'
import { prisma } from '@/lib/prisma'

export async function createInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/clubs/:slug/invites',
    {
      schema: {
        tags: ['invites'],
        summary: 'Create a new invite',
        security: [{ bearerAuth: [] }],
        body: z.object({
          email: z.email(),
          role: roleSchema,
        }),
        params: z.object({
          slug: z.string(),
        }),
        response: {
          201: z.object({
            inviteId: z.uuid(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params
      const userId = await request.getCurrentUserId()
      const { club, memberShip } = await request.getUserMemberShip(slug)

      const { cannot } = getUserPermissions(userId, memberShip.role)

      if (cannot('create', 'Invite')) {
        throw new UnauthorizedError(`You're not allowed to create new invites`)
      }
      const { email, role } = request.body

      const [, domain] = email.split('@')

      if (club.shouldAttachUsersByDomain && club.domain) {
        throw new BadRequestError(
          `User with ${domain} damain will join your club automaticaly on login`
        )
      }

      const inviteWithSameEmail = await prisma.invite.findUnique({
        where: {
          email_clubId: {
            email,
            clubId: club.id,
          },
        },
      })

      if (inviteWithSameEmail) {
        throw new BadRequestError(
          'Another invite with same e-mail already exists'
        )
      }

      const memberWithSameEmail = await prisma.member.findFirst({
        where: {
          clubId: club.id,
          user: {
            email,
          },
        },
      })

      if (memberWithSameEmail) {
        throw new BadRequestError(
          'Another invite with same e-mail already belongs to your club'
        )
      }

      const invite = await prisma.invite.create({
        data: {
          clubId: club.id,
          email,
          role,
          authorId: userId,
        },
      })

      return reply.status(201).send({
        inviteId: invite.id,
      })
    }
  )
}
