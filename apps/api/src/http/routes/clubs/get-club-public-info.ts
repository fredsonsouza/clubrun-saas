import { PublicClubDto, publicClubSelect, toPublicClubDto } from '@/http/dtos'
import { prisma } from '@/lib/prisma'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import type { FastifyInstance } from 'fastify/types/instance'
import z from 'zod'
import { BadRequestError } from '../_errors/bad-request-error'

export async function getClubPublicInfo(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/clubs/:slug/public',
    {
      schema: {
        tags: ['clubs'],
        summary: 'Get public details from club',
        params: z.object({
          slug: z.string(),
        }),
        response: {
          200: z.object({
            club: PublicClubDto,
          }),
        },
      },
    },
    async (request) => {
      const { slug } = request.params

      const club = await prisma.club.findUnique({
        where: { slug },
        select: publicClubSelect,
      })

      if (!club) {
        throw new BadRequestError('Club not found')
      }

      return {
        club: toPublicClubDto(club),
      }
    }
  )
}
