import { app } from '@/http/server'
import { beforeAll, describe, expect, it } from 'vitest'

describe('Operational endpoints', () => {
  beforeAll(async () => {
    await app.ready()
  })

  it('exposes a liveness healthcheck without database access', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ status: 'ok' })
    expect(response.headers['x-request-id']).toBeTruthy()
    expect(response.headers['x-content-type-options']).toBe('nosniff')
  })

  it('exposes request metrics without sensitive request data', async () => {
    const response = await app.inject({ method: 'GET', url: '/metrics' })
    const body = response.json()

    expect(response.statusCode).toBe(200)
    expect(body).toEqual(
      expect.objectContaining({
        requests: expect.any(Number),
        errors: expect.any(Number),
        averageRequestDurationMs: expect.any(Number),
      })
    )
    expect(JSON.stringify(body)).not.toContain('authorization')
  })
})
