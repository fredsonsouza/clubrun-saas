import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import { faker } from '@faker-js/faker'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('Transfer Club Ownership (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to transfer club ownership', async () => {
    const { token, club } = await createAndAuthenticateUser(app, 'OWNER')
    if (!club) {
      throw new Error('Expected authenticated user to have a club')
    }

    // Cria um segundo usuário e o adiciona como membro do clube
    const secondUser = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
      },
    })

    await prisma.member.create({
      data: {
        userId: secondUser.id,
        clubId: club.id,
        role: 'ATHLETE',
      },
    })

    const response = await request(app.server)
      .patch(`/clubs/${club?.slug}/owner`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        transferToUserId: secondUser.id,
      })

    expect(response.statusCode).toBe(204)

    const updatedClub = await prisma.club.findUnique({
      where: { id: club?.id },
    })

    expect(updatedClub?.ownerId).toBe(secondUser.id)

    const secondUserMembership = await prisma.member.findUnique({
      where: {
        clubId_userId: {
          clubId: club.id,
          userId: secondUser.id,
        },
      },
    })

    expect(secondUserMembership?.role).toBe('OWNER')
  })

  it('should not be able to transfer ownership to a non-member', async () => {
    const { token, club } = await createAndAuthenticateUser(app, 'OWNER')

    const anotherUser = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
      },
    })

    const response = await request(app.server)
      .patch(`/clubs/${club?.slug}/owner`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        transferToUserId: anotherUser.id,
      })

    expect(response.statusCode).toBe(400)
    expect(response.body.message).toBe(
      'Target user must be an active member of this club'
    )
  })

  it('should not be able to transfer ownership if user is not the owner', async () => {
    const { token, club } = await createAndAuthenticateUser(app, 'ATHLETE')

    const response = await request(app.server)
      .patch(`/clubs/${club?.slug}/owner`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        transferToUserId: faker.string.uuid(),
      })

    expect(response.statusCode).toBe(403)
  })

  it('should not be able to transfer ownership with invalid data', async () => {
    const { token, club } = await createAndAuthenticateUser(app, 'OWNER')

    const response = await request(app.server)
      .patch(`/clubs/${club?.slug}/owner`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        transferToUserId: 'not-a-uuid',
      })

    expect(response.statusCode).toBe(400)
    expect(response.body.message).toBe('Validation error')
  })
})
