import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/utils/audit-log'
import { createSlug } from '@/utils/create-slug'
import { isSimulatedFlowAllowed } from '@/utils/simulated-flow-policy'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { ForbiddenError } from '../_errors/forbidden-error'

export async function createClub(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/clubs',
      {
        schema: {
          tags: ['clubs'],
          summary: 'Create a new club',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            domain: z.string().nullish(),
            cnpj: z.string().nullish(),
            shouldAttachUsersByDomain: z.boolean().optional(),
          }),
          response: {
            201: z.object({
              clubId: z.uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { isSystemAdmin: true },
        })

        if (
          !isSimulatedFlowAllowed(process.env.NODE_ENV) &&
          !user?.isSystemAdmin
        ) {
          throw new ForbiddenError(
            'A criação de clubes em produção está restrita a administradores do sistema até a integração do entitlement real.'
          )
        }

        const userMemberShips = await prisma.member.findMany({
          where: {
            userId,
            status: 'ACTIVE',
          },
        })

        const isOwnerOfAll = userMemberShips.every((m) => m.role === 'OWNER')
        const hasMemberShips = userMemberShips.length > 0

        // Super admins can create as many as they want
        // Owners can create as many as they want
        // Others (ATHLETE, COACH, etc) can only create if they have no clubs yet
        if (!user?.isSystemAdmin && hasMemberShips && !isOwnerOfAll) {
          throw new BadRequestError(
            'As a member, coach, or manager, you can only belong to one active club. Owners can have multiple clubs.'
          )
        }

        const { name, domain, shouldAttachUsersByDomain, cnpj } = request.body
        const slug = createSlug(name)

        const clubBySlug = await prisma.club.findUnique({
          where: { slug },
        })

        if (clubBySlug) {
          throw new BadRequestError(
            'Another club with same name already exists!'
          )
        }

        if (domain) {
          const clubByDomain = await prisma.club.findUnique({
            where: { domain },
          })

          if (clubByDomain) {
            throw new BadRequestError(
              'Another club with same domain already exists!'
            )
          }
        }
        const club = await prisma.club.create({
          data: {
            name,
            slug,
            domain,
            cnpj,
            shouldAttachUsersByDomain,
            ownerId: userId,
            members: {
              create: {
                userId,
                role: 'OWNER',
              },
            },
          },
        })

        await createAuditLog({
          action: 'CLUB_CREATED',
          entity: 'CLUB',
          entityId: club.id,
          userId,
          payload: { name: club.name, slug: club.slug },
        })

        return reply.status(201).send({
          clubId: club.id,
        })
      }
    )
}
