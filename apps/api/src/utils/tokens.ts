import {
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from 'node:crypto'
import { env } from '@saas/env'
import type { TokenType } from '../../generated/prisma/client'

export const PASSWORD_RECOVERY_TTL_MS = 30 * 60 * 1000
export const EMAIL_VERIFICATION_TTL_MS = 15 * 60 * 1000
export const EMAIL_VERIFICATION_MAX_ATTEMPTS = 5

interface TokenTransaction {
  token: {
    create(args: unknown): Promise<any>
    findFirst(args: unknown): Promise<any>
    findUnique(args: unknown): Promise<any>
    updateMany(args: unknown): Promise<{ count: number }>
  }
}

export function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

export function digestOtp(
  code: string,
  userId: string,
  type: TokenType
): string {
  return createHmac('sha256', env.TOKEN_PEPPER)
    .update(`${userId}:${type}:${code}`, 'utf8')
    .digest('hex')
}

export function createBearerToken(): { token: string; digest: string } {
  const token = randomBytes(32).toString('base64url')
  return { token, digest: sha256(token) }
}

export function createOtp(
  userId: string,
  type: TokenType
): {
  code: string
  digest: string
} {
  const code = randomInt(0, 1_000_000).toString().padStart(6, '0')
  return { code, digest: digestOtp(code, userId, type) }
}

async function invalidatePreviousTokens(
  tx: TokenTransaction,
  userId: string,
  type: TokenType,
  now: Date
) {
  await tx.token.updateMany({
    where: { userId, type, consumedAt: null },
    data: { consumedAt: now },
  })
}

export async function issueBearerTokenInTransaction(
  tx: TokenTransaction,
  userId: string,
  type: TokenType,
  ttlMs: number
): Promise<string> {
  const now = new Date()
  const { token, digest } = createBearerToken()

  await invalidatePreviousTokens(tx, userId, type, now)
  await tx.token.create({
    data: {
      digest,
      type,
      expiresAt: new Date(now.getTime() + ttlMs),
      userId,
    },
  })

  return token
}

export async function issueOtpInTransaction(
  tx: TokenTransaction,
  userId: string,
  type: TokenType,
  ttlMs: number
): Promise<string> {
  const now = new Date()
  const { code, digest } = createOtp(userId, type)

  await invalidatePreviousTokens(tx, userId, type, now)
  await tx.token.create({
    data: {
      digest,
      type,
      expiresAt: new Date(now.getTime() + ttlMs),
      userId,
    },
  })

  return code
}

export async function consumeBearerTokenInTransaction(
  tx: TokenTransaction,
  rawToken: string,
  type: TokenType,
  now = new Date()
): Promise<{ userId: string } | null> {
  const token = await tx.token.findUnique({
    where: { digest: sha256(rawToken) },
    select: {
      id: true,
      userId: true,
      type: true,
      expiresAt: true,
      consumedAt: true,
    },
  })

  if (
    !token ||
    token.type !== type ||
    token.consumedAt ||
    token.expiresAt <= now
  ) {
    return null
  }

  const consumed = await tx.token.updateMany({
    where: {
      id: token.id,
      type,
      consumedAt: null,
      expiresAt: { gt: now },
    },
    data: { consumedAt: now },
  })

  return consumed.count === 1 ? { userId: token.userId } : null
}

function digestsEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, 'hex')
  const rightBuffer = Buffer.from(right, 'hex')
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  )
}

export async function consumeOtpInTransaction(
  tx: TokenTransaction,
  userId: string,
  code: string,
  type: TokenType,
  maxAttempts = EMAIL_VERIFICATION_MAX_ATTEMPTS,
  now = new Date()
): Promise<boolean> {
  const token = await tx.token.findFirst({
    where: {
      userId,
      type,
      consumedAt: null,
      expiresAt: { gt: now },
      attempts: { lt: maxAttempts },
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true, digest: true, attempts: true },
  })

  if (!token) return false

  const expectedDigest = digestOtp(code, userId, type)
  if (!digestsEqual(token.digest, expectedDigest)) {
    await tx.token.updateMany({
      where: {
        id: token.id,
        consumedAt: null,
        attempts: token.attempts,
      },
      data: { attempts: { increment: 1 } },
    })
    return false
  }

  const consumed = await tx.token.updateMany({
    where: {
      id: token.id,
      digest: expectedDigest,
      consumedAt: null,
      expiresAt: { gt: now },
      attempts: token.attempts,
    },
    data: { consumedAt: now },
  })

  return consumed.count === 1
}
