import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import { faker } from '@faker-js/faker'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('Update Member (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to update a member role', async () => {
    const { token, club } = await createAndAuthenticateUser(app, 'OWNER')

    // Cria um segundo usuário e o adiciona como membro do clube
    const secondUser = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
      },
    })

    const member = await prisma.member.create({
      data: {
        userId: secondUser.id,
        clubId: club?.id!,
        role: 'ATHLETE',
      },
    })

    const response = await request(app.server)
      .put(`/clubs/${club?.slug}/members/${member.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        role: 'MANAGER',
      })

    expect(response.statusCode).toBe(204)

    const updatedMember = await prisma.member.findUnique({
      where: { id: member.id },
    })

    expect(updatedMember?.role).toBe('MANAGER')
  })

  it('should be able to update a member status', async () => {
    const { token, club } = await createAndAuthenticateUser(app, 'OWNER')

    const secondUser = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
      },
    })

    const member = await prisma.member.create({
      data: {
        userId: secondUser.id,
        clubId: club?.id!,
        role: 'ATHLETE',
        status: 'ACTIVE',
      },
    })

    const response = await request(app.server)
      .put(`/clubs/${club?.slug}/members/${member.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        role: 'ATHLETE',
        status: 'INACTIVE',
      })

    expect(response.statusCode).toBe(204)

    const updatedMember = await prisma.member.findUnique({
      where: { id: member.id },
    })

    expect(updatedMember?.status).toBe('INACTIVE')
  })

  it('should not be able to update a member if user is just a ATHLETE', async () => {
    const { token, club } = await createAndAuthenticateUser(app, 'ATHLETE')

    const response = await request(app.server)
      .put(`/clubs/${club?.slug}/members/${faker.string.uuid()}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        role: 'OWNER',
      })

    expect(response.statusCode).toBe(401)
  })

  it('should not be able to update a member with invalid data', async () => {
    const { token, club } = await createAndAuthenticateUser(app, 'OWNER')

    const response = await request(app.server)
      .put(`/clubs/${club?.slug}/members/${faker.string.uuid()}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        role: 'INVALID_ROLE',
        status: 'INVALID_STATUS',
      })

    expect(response.statusCode).toBe(400)
    expect(response.body.message).toBe('Validation error')
  })
})
