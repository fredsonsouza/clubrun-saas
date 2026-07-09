import { randomUUID } from 'node:crypto'
import { pool, prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'

export async function createAndAuthenticateUser(
  app: FastifyInstance,
  role?: 'OWNER' | 'MANAGER' | 'ADMIN' | 'ATHLETE' | 'COACH' | 'BILLING'
) {
  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: `johndoe-${randomUUID()}@example.com`,
      passwordHash: '$2a$10$asdfghjklpowieurytqxcvbnm', // Pre-computed or dummy hash
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
