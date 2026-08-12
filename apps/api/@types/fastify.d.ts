import 'fastify'

import type { Club, Member } from '../generated/prisma/client'

type AuthClub = Pick<
  Club,
  | 'id'
  | 'name'
  | 'slug'
  | 'domain'
  | 'cnpj'
  | 'inviteToken'
  | 'shouldAttachUsersByDomain'
  | 'avatarUrl'
  | 'subscriptionStatus'
  | 'description'
  | 'city'
  | 'state'
  | 'bannerUrl'
  | 'status'
  | 'createdAt'
  | 'updatedAt'
  | 'ownerId'
>

declare module 'fastify' {
  export interface FastifyRequest {
    getCurrentUserId(options?: { allowUnverified?: boolean }): Promise<string>
    getUserMemberShip(slug: string): Promise<{
      club: AuthClub
      memberShip: Member & { isSystemAdmin: boolean }
    }>
  }
}
