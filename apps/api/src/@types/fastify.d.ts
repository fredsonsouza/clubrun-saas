import type { Club, Member } from '../../generated/prisma/client'

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

type ActiveUserMembership = Member & { isSystemAdmin: boolean }

interface CurrentUserOptions {
  allowUnverified?: boolean
}

declare module 'fastify' {
  export interface FastifyRequest {
    getCurrentUserId(options?: CurrentUserOptions): Promise<string>
    getUserMemberShip(slug: string): Promise<{
      club: AuthClub
      memberShip: ActiveUserMembership
    }>
  }
}
