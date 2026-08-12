import { randomBytes } from 'node:crypto'
import {
  requireActiveMembership,
  requireClubAbility,
} from '@/authorization/club-authorization'
import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

import { env } from '@saas/env'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'


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
        const context = await requireActiveMembership(request, slug)
        requireClubAbility(context, 'create', 'Invite')
        const { club } = context

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
