import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'

export async function createAndAuthenticateUser(
  app: FastifyInstance,
  role?: 'OWNER' | 'MANAGER' | 'ADMIN' | 'MEMBER' | 'COACH' | 'BILLING'
) {
  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: `johndoe-${randomUUID()}@example.com`,
      passwordHash: await hash('123456', 6),
    },
  })

  let club = null

  if (role) {
    club = await prisma.club.create({
      data: {
        name: 'Sample Club',
        slug: `sample-club-${randomUUID()}`,
        ownerId: user.id,
      },
    })

    await prisma.member.create({
      data: {
        userId: user.id,
        clubId: club.id,
        role,
      },
    })
  }

  // Geramos o token nativamente, muito mais rápido e sem depender da rota HTTP de login
  const token = (app as any).jwt.sign({ sub: user.id })

  return { token, user, club }
}
