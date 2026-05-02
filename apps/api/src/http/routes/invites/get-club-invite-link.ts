import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import { randomBytes } from 'node:crypto'
import z from 'zod'
import { env } from '@saas/env'

export async function getClubInviteLink(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/clubs/:slug/invite-link',
      {
        schema: {
          tags: ['invites'],
          summary: 'Get or generate a shareable invite link for the club',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              inviteLink: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params
        const userId = await request.getCurrentUserId()
        const { club, memberShip } = await request.getUserMemberShip(slug)

        const { cannot } = getUserPermissions(userId, memberShip.role, memberShip.isSystemAdmin)

        if (cannot('create', 'Invite')) {
          throw new UnauthorizedError(`You're not allowed to manage invites`)
        }

        let inviteToken = club.inviteToken

        if (!inviteToken) {
          inviteToken = randomBytes(10).toString('hex')
          await prisma.club.update({
            where: { id: club.id },
            data: { inviteToken },
          })
        }

        const inviteLink = `${env.NEXT_PUBLIC_APP_URL}/join/${club.slug}?token=${inviteToken}`

        return { inviteLink }
      }
    )
}
