import {
  hashPassword,
  normalizeEmail,
  passwordSchema,
  verifyPassword,
} from '@/utils/identity'
import {
  EMAIL_VERIFICATION_MAX_ATTEMPTS,
  consumeOtpInTransaction,
  digestOtp,
  issueBearerTokenInTransaction,
} from '@/utils/tokens'
import { hash as hashBcrypt } from 'bcryptjs'
import { describe, expect, it, vi } from 'vitest'

describe('Identity core utilities', () => {
  it('normalizes e-mail consistently', () => {
    expect(normalizeEmail('  Runner@Example.COM\t')).toBe('runner@example.com')
  })

  it('enforces the single 6..128 password policy', () => {
    expect(passwordSchema.safeParse('x'.repeat(5)).success).toBe(false)
    expect(passwordSchema.safeParse('x'.repeat(6)).success).toBe(true)
    expect(passwordSchema.safeParse('x'.repeat(128)).success).toBe(true)
    expect(passwordSchema.safeParse('x'.repeat(129)).success).toBe(false)
  })

  it('creates Argon2id hashes and identifies valid legacy bcrypt for rehash', async () => {
    const argonHash = await hashPassword('a-secure-password')
    expect(argonHash).toMatch(/^\$argon2id\$/)
    await expect(
      verifyPassword('a-secure-password', argonHash)
    ).resolves.toEqual({
      valid: true,
      needsRehash: false,
    })

    const legacyHash = await hashBcrypt('legacy-password', 4)
    await expect(
      verifyPassword('legacy-password', legacyHash)
    ).resolves.toEqual({
      valid: true,
      needsRehash: true,
    })
  })

  it('invalidates prior tokens of the same type before bearer issuance', async () => {
    const tx = {
      token: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        create: vi.fn().mockResolvedValue({}),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
      },
    }

    const rawToken = await issueBearerTokenInTransaction(
      tx,
      'user-id',
      'PASSWORD_RECOVER',
      30 * 60 * 1000
    )

    expect(rawToken).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(tx.token.updateMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-id',
        type: 'PASSWORD_RECOVER',
        consumedAt: null,
      },
      data: { consumedAt: expect.any(Date) },
    })
    const persisted = tx.token.create.mock.calls[0][0].data
    expect(persisted.digest).toMatch(/^[a-f0-9]{64}$/)
    expect(persisted).not.toHaveProperty('token')
  })

  it('increments OTP attempts and stops accepting after five attempts', async () => {
    const token = {
      id: 'otp-id',
      digest: digestOtp('123456', 'user-id', 'EMAIL_VERIFICATION'),
      attempts: EMAIL_VERIFICATION_MAX_ATTEMPTS - 1,
    }
    const tx = {
      token: {
        findFirst: vi.fn().mockResolvedValue(token),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        create: vi.fn(),
        findUnique: vi.fn(),
      },
    }

    await expect(
      consumeOtpInTransaction(tx, 'user-id', '000000', 'EMAIL_VERIFICATION')
    ).resolves.toBe(false)
    expect(tx.token.updateMany).toHaveBeenCalledWith({
      where: { id: 'otp-id', consumedAt: null, attempts: 4 },
      data: { attempts: { increment: 1 } },
    })
  })
})
