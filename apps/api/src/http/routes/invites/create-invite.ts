import { getUserPermissions } from '@/utils/get-user-permissions'
import { roleSchema } from '@saas/auth'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { BadRequestError } from '../_errors/bad-request-error'
import { prisma } from '@/lib/prisma'

import { auth } from '@/http/middlewares/auth'
import { resend } from '@/lib/mail'
import { env } from '@saas/env'

export async function createInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
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

        const { cannot } = getUserPermissions(
          userId,
          memberShip.role,
          memberShip.isSystemAdmin
        )

        if (cannot('create', 'Invite')) {
          throw new UnauthorizedError(
            `You're not allowed to create new invites`
          )
        }

        const { email, role } = request.body

        // Role security validation
        if (memberShip.role === 'ATHLETE' && role !== 'ATHLETE') {
          throw new UnauthorizedError(
            'As an athlete, you can only invite other athletes.'
          )
        }

        if (role === 'OWNER') {
          throw new UnauthorizedError(
            'You cannot invite someone as an owner. Use the transfer ownership flow instead.'
          )
        }

        const [, domain] = email.split('@')

        if (
          club.shouldAttachUsersByDomain &&
          club.domain &&
          domain === club.domain
        ) {
          throw new BadRequestError(
            `User with ${domain} domain will join your club automatically on login`
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

        // DISPARO DO E-MAIL (Resend)
        // Nota: No ambiente local, se não houver API Key, o Resend apenas não fará nada ou dará erro silencioso.
        try {
          // const { resend } = await import('@/lib/mail')
          // const { env } = await import('@saas/env')

          await resend.emails.send({
            from: 'ClubRun <onboarding@resend.dev>',
            to: email,
            subject: `Você foi convidado para o clube ${club.name}`,
            html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #111;">
              <h2 style="color: #f97316;">Olá, corredor!</h2>
              <p>Você foi convidado por <strong>${memberShip.name || 'um administrador'}</strong> para se juntar ao clube <strong>${club.name}</strong> no ClubRun.</p>
              <p>Como membro do clube, você poderá acompanhar treinos, participar de rankings e evoluir sua performance junto com o time.</p>
              <div style="margin-top: 24px;">
                <a href="${env.NEXT_PUBLIC_APP_URL}/join/${club.slug}?inviteId=${invite.id}&email=${email}" 
                   style="background-color: #f97316; color: #fff; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block;">
                   ACEITAR CONVITE
                </a>
              </div>
              <p style="margin-top: 32px; font-size: 12px; color: #666;">Se você não esperava este convite, pode ignorar este e-mail.</p>
            </div>
          `,
          })
        } catch (error) {
          console.error('Falha ao enviar e-mail de convite:', error)
          // Não travamos o fluxo se o e-mail falhar, pois o convite já foi criado no banco
        }

        return reply.status(201).send({
          inviteId: invite.id,
        })
      }
    )
}
