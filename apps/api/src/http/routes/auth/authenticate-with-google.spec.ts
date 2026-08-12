import { app } from '@/http/server'
import { prisma } from '@/lib/prisma'
import { consumeOAuthAttemptInTransaction } from '@/utils/oauth'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/utils/oauth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/oauth')>()),
  consumeOAuthAttemptInTransaction: vi.fn(),
}))
vi.mock('@/lib/prisma', () => {
  const prisma = {
    account: { findUnique: vi.fn() },
    user: { findUnique: vi.fn(), create: vi.fn() },
    oAuthAttempt: { create: vi.fn() },
    auditLog: { create: vi.fn() },
    $transaction: vi.fn(async (callback: (tx: any) => unknown) =>
      callback(prisma)
    ),
  }
  return { prisma }
})

const state = 'state-that-is-random-and-at-least-32-chars'
const codeVerifier = 'v'.repeat(43)

function mockGoogleUser(overrides: Record<string, unknown> = {}) {
  vi.mocked(global.fetch)
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'google-access-token' }),
    } as Response)
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sub: 'google-id',
        name: 'John Doe',
        email: 'John@Example.COM',
        email_verified: true,
        picture: 'https://example.com/avatar.jpg',
        ...overrides,
      }),
    } as Response)
}

async function authenticate() {
  return app.inject({
    method: 'POST',
    url: '/sessions/google',
    body: { code: 'google-code', state, codeVerifier },
  })
}

describe('Authenticate with Google (Unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    vi.mocked(consumeOAuthAttemptInTransaction).mockResolvedValue(true)
  })

  it('uses account-first lookup and authenticates the account owner', async () => {
    mockGoogleUser()
    vi.mocked(prisma.account.findUnique).mockResolvedValue({
      user: { id: 'account-user-id', sessionVersion: 7 },
    } as any)

    const response = await authenticate()

    expect(response.statusCode).toBe(201)
    expect(prisma.account.findUnique).toHaveBeenCalledTimes(1)
    expect(prisma.user.findUnique).not.toHaveBeenCalled()
    const payload = app.jwt.decode(response.json().token) as any
    expect(payload).toMatchObject({ sub: 'account-user-id', sv: 7 })
    const tokenRequest = vi.mocked(global.fetch).mock.calls[0][1]
    expect((tokenRequest?.body as URLSearchParams).get('code_verifier')).toBe(
      codeVerifier
    )
  })

  it('creates a verified user and Account when neither exists', async () => {
    mockGoogleUser()
    vi.mocked(prisma.account.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'new-user-id',
      sessionVersion: 0,
    } as any)

    const response = await authenticate()

    expect(response.statusCode).toBe(201)
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'john@example.com',
        emailVerifiedAt: expect.any(Date),
        accounts: {
          create: { provider: 'GOOGLE', providerAccountId: 'google-id' },
        },
      }),
      select: { id: true, sessionVersion: true },
    })
  })

  it('refuses implicit linking when an e-mail user already exists', async () => {
    mockGoogleUser()
    vi.mocked(prisma.account.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'existing-user-id',
    } as any)

    const response = await authenticate()

    expect(response.statusCode).toBe(409)
    expect(response.json()).toEqual({ error: 'linking_required' })
    expect(prisma.user.create).not.toHaveBeenCalled()
  })

  it('requires Google email_verified=true', async () => {
    mockGoogleUser({ email_verified: false })

    const response = await authenticate()

    expect(response.statusCode).toBe(400)
    expect(response.json()).toEqual({ error: 'google_email_unverified' })
    expect(prisma.account.findUnique).not.toHaveBeenCalled()
  })

  it('rejects an invalid or replayed OAuth attempt before calling Google', async () => {
    vi.mocked(consumeOAuthAttemptInTransaction).mockResolvedValue(false)

    const response = await authenticate()

    expect(response.statusCode).toBe(400)
    expect(response.json()).toEqual({ error: 'invalid_oauth_attempt' })
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
