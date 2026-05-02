import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'
import { createSlug } from '@/utils/create-slug'
import { createAuditLog } from '@/utils/audit-log'

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

        const userMemberShips = await prisma.member.findMany({
          where: {
            userId,
            status: 'ACTIVE',
          },
        })

        const isOwnerOfAll = userMemberShips.every(m => m.role === 'OWNER')
        const hasMemberShips = userMemberShips.length > 0
        
        const user = await prisma.user.findUnique({ where: { id: userId } })

        // Super admins can create as many as they want
        // Owners can create as many as they want
        // Others (ATHLETE, COACH, etc) can only create if they have no clubs yet
        if (!user?.isSystemAdmin && hasMemberShips && !isOwnerOfAll) {
          throw new BadRequestError('As a member, coach, or manager, you can only belong to one active club. Owners can have multiple clubs.')
        }

        const { name, domain, shouldAttachUsersByDomain, cnpj } = request.body
        const slug = createSlug(name)

        const clubBySlug = await prisma.club.findUnique({
          where: { slug },
        })

        if (clubBySlug) {
          throw new BadRequestError('Another club with same name already exists!')
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
