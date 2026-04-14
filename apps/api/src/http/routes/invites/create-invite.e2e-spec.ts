import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import { faker } from '@faker-js/faker'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('Create Invite (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create a new invite', async () => {
    const { token, club } = await createAndAuthenticateUser(app, 'OWNER')

    const inviteEmail = faker.internet.email()

    const response = await request(app.server)
      .post(`/clubs/${club?.slug}/invites`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: inviteEmail,
        role: 'MEMBER',
      })

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty('inviteId')

    const invite = await prisma.invite.findUnique({
      where: {
        id: response.body.inviteId,
      },
    })

    expect(invite).not.toBeNull()
    expect(invite?.email).toBe(inviteEmail)
    expect(invite?.role).toBe('MEMBER')
  })

  it('should not be able to create an invite with unauthorized role (BILLING)', async () => {
    const { token, club } = await createAndAuthenticateUser(app, 'BILLING')

    const response = await request(app.server)
      .post(`/clubs/${club?.slug}/invites`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: faker.internet.email(),
        role: 'MEMBER',
      })

    expect(response.statusCode).toBe(401)
  })

  it('should not be able to create an invite if email domain matches club auto-attach domain', async () => {
    const { token, user } = await createAndAuthenticateUser(app)
    
    const domain = faker.internet.domainName()

    // Cria um clube com auto-attach
    const club = await prisma.club.create({
      data: {
        name: faker.company.name(),
        slug: faker.string.uuid(),
        domain,
        shouldAttachUsersByDomain: true,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: 'OWNER',
          },
        },
      },
    })

    const response = await request(app.server)
      .post(`/clubs/${club.slug}/invites`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: `test@${domain}`,
        role: 'MEMBER',
      })

    expect(response.statusCode).toBe(400)
    expect(response.body.message).toMatch(/will join your club automatically on login/)
  })

  it('should not be able to create an invite for the same email twice', async () => {
    const { token, club } = await createAndAuthenticateUser(app, 'OWNER')
    const email = faker.internet.email()

    // Primeiro convite
    await request(app.server)
      .post(`/clubs/${club?.slug}/invites`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email, role: 'MEMBER' })

    // Segundo convite igual
    const response = await request(app.server)
      .post(`/clubs/${club?.slug}/invites`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email, role: 'MANAGER' })

    expect(response.statusCode).toBe(400)
    expect(response.body.message).toBe('Another invite with same e-mail already exists')
  })

  it('should not be able to invite someone who is already a member', async () => {
    const { token, club } = await createAndAuthenticateUser(app, 'OWNER')
    
    const secondUserEmail = faker.internet.email()
    await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: secondUserEmail,
        members_on: {
          create: {
            clubId: club?.id!,
            role: 'MEMBER',
          },
        },
      },
    })

    const response = await request(app.server)
      .post(`/clubs/${club?.slug}/invites`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: secondUserEmail,
        role: 'MEMBER',
      })

    expect(response.statusCode).toBe(400)
    expect(response.body.message).toBe('Another invite with same e-mail already belongs to your club')
  })

  it('should not be able to create an invite with invalid data', async () => {
    const { token, club } = await createAndAuthenticateUser(app, 'OWNER')

    const response = await request(app.server)
      .post(`/clubs/${club?.slug}/invites`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'invalid-email',
        role: 'INVALID_ROLE',
      })

    expect(response.statusCode).toBe(400)
    expect(response.body.message).toBe('Validation error')
  })
})
