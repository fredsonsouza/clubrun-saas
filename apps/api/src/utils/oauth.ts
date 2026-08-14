import { createHash, timingSafeEqual } from 'node:crypto'
import { sha256 } from './tokens'

export const OAUTH_ATTEMPT_TTL_MS = 10 * 60 * 1000

export function createPkceChallenge(codeVerifier: string): string {
  return createHash('sha256').update(codeVerifier, 'utf8').digest('base64url')
}

export function validatePkce(
  codeVerifier: string,
  expectedChallenge: string
): boolean {
  const actual = Buffer.from(createPkceChallenge(codeVerifier))
  const expected = Buffer.from(expectedChallenge)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export async function consumeOAuthAttemptInTransaction(
  tx: {
    oAuthAttempt: {
      findUnique(args: unknown): Promise<any>
      updateMany(args: unknown): Promise<{ count: number }>
    }
  },
  state: string,
  codeVerifier: string,
  now = new Date()
): Promise<boolean> {
  const stateDigest = sha256(state)
  const attempt = await tx.oAuthAttempt.findUnique({
    where: { stateDigest },
    select: {
      id: true,
      pkceChallenge: true,
      expiresAt: true,
      consumedAt: true,
    },
  })

  if (
    !attempt ||
    attempt.consumedAt ||
    attempt.expiresAt <= now ||
    !validatePkce(codeVerifier, attempt.pkceChallenge)
  ) {
    return false
  }

  const consumed = await tx.oAuthAttempt.updateMany({
    where: {
      id: attempt.id,
      stateDigest,
      consumedAt: null,
      expiresAt: { gt: now },
    },
    data: { consumedAt: now },
  })

  return consumed.count === 1
}
