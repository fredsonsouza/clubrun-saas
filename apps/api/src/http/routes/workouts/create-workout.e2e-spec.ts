import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import { faker } from '@faker-js/faker'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('Create Workout (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to register a new workout', async () => {
    const { token, user, club } = await createAndAuthenticateUser(
      app,
      'ATHLETE'
    )

    const title = faker.lorem.words(3)
    const distance = faker.number.float({ min: 1, max: 50, fractionDigits: 2 })
    const duration = faker.number.int({ min: 300, max: 18000 })
    const pace = faker.number.float({ min: 3, max: 10, fractionDigits: 2 })
    const type = faker.helpers.arrayElement(['EASY', 'INTERVAL', 'LONG'])
    const notes = faker.lorem.sentence()
    const date = new Date().toISOString()

    const response = await request(app.server)
      .post(`/clubs/${club?.slug}/workouts`)
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', `e2e-workout-${faker.string.uuid()}`)
      .send({
        title,
        notes,
        distance,
        duration,
        pace,
        type,
        date,
      })

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty('workoutId')

    const workout = await prisma.workout.findFirst({
      where: {
        id: response.body.workoutId,
      },
    })

    expect(workout).not.toBeNull()
    expect(workout).toMatchObject({
      title,
      notes,
      distance,
      duration,
      pace: duration / 60 / distance,
      type,
      clubId: club?.id,
      athleteId: user.id,
    })
  })

  it('should not be able to register a workout in a club without being a member', async () => {
    const { token } = await createAndAuthenticateUser(app) // Usuário sem clube

    // Tentativa de postar em um slug aleatório
    const response = await request(app.server)
      .post('/clubs/clube-inexistente/workouts')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', `e2e-workout-invalid-${faker.string.uuid()}`)
      .send({
        title: faker.lorem.words(2),
        distance: 3000,
        duration: 900,
        pace: 5.0,
        type: 'EASY',
        date: new Date().toISOString(),
      })

    expect(response.statusCode).toBe(400)
  })

  it('should not be able to register a workout with invalid data', async () => {
    const { token, club } = await createAndAuthenticateUser(app, 'ATHLETE')

    const response = await request(app.server)
      .post(`/clubs/${club?.slug}/workouts`)
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', `e2e-workout-invalid-${faker.string.uuid()}`)
      .send({
        title: faker.lorem.words(1),
        distance: 'invalid', // Deveria ser número
        duration: -100, // Deveria ser positivo
        date: 'invalid-date',
      })

    expect(response.statusCode).toBe(400)
    expect(response.body.message).toBe('Validation error')
  })

  it('does not double-create a workout when the same key is retried', async () => {
    const { token, user, club } = await createAndAuthenticateUser(
      app,
      'ATHLETE'
    )
    const key = `e2e-workout-retry-${faker.string.uuid()}`
    const payload = {
      title: 'Concurrent retry workout',
      distance: 5,
      duration: 1800,
      type: 'EASY',
      date: new Date().toISOString(),
    }

    const responses = await Promise.all([
      request(app.server)
        .post(`/clubs/${club?.slug}/workouts`)
        .set('Authorization', `Bearer ${token}`)
        .set('Idempotency-Key', key)
        .send(payload),
      request(app.server)
        .post(`/clubs/${club?.slug}/workouts`)
        .set('Authorization', `Bearer ${token}`)
        .set('Idempotency-Key', key)
        .send(payload),
    ])

    expect(responses.map((response) => response.statusCode).sort()).toEqual([
      201, 409,
    ])
    expect(
      responses.find((response) => response.statusCode === 201)?.body.workoutId
    ).toBeDefined()
    const workouts = await prisma.workout.findMany({
      where: { athleteId: user.id, title: payload.title },
    })
    expect(workouts).toHaveLength(1)
  })

  it('should not be able to register a workout with unauthorized role (BILLING)', async () => {
    const { token, club } = await createAndAuthenticateUser(app, 'BILLING')

    const response = await request(app.server)
      .post(`/clubs/${club?.slug}/workouts`)
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', `e2e-workout-role-${faker.string.uuid()}`)
      .send({
        title: faker.lorem.words(3),
        distance: 5,
        duration: 1500,
        pace: 5.0,
        type: 'EASY',
        date: new Date().toISOString(),
      })

    expect(response.statusCode).toBe(403)
  })
})
