import { Algorithm, hash, verify } from '@node-rs/argon2'
import { compare as verifyBcrypt } from 'bcryptjs'
import { z } from 'zod'

export const passwordSchema = z.string().min(12).max(128)

const ARGON2_OPTIONS = {
  algorithm: Algorithm.Argon2id,
  memoryCost: 65_536,
  timeCost: 2,
  parallelism: 1,
  outputLen: 32,
} as const

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2_OPTIONS)
}

export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<{ valid: boolean; needsRehash: boolean }> {
  if (passwordHash.startsWith('$argon2id$')) {
    return {
      valid: await verify(passwordHash, password),
      needsRehash: false,
    }
  }

  if (passwordHash.startsWith('$2')) {
    const valid = await verifyBcrypt(password, passwordHash)
    return { valid, needsRehash: valid }
  }

  return { valid: false, needsRehash: false }
}
