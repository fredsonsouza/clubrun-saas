import type { Club, Member } from '../../generated/prisma/client'

type UserMemberShip =
  | (Member & { isSystemAdmin: boolean })
  | (Pick<Member, 'id' | 'userId' | 'status' | 'clubId'> & {
      role: 'VISITOR'
      isSystemAdmin: boolean
    })

declare module 'fastify' {
  export interface FastifyRequest {
    getCurrentUserId(): Promise<string>
    getUserMemberShip(slug: string): Promise<{
      club: Club
      memberShip: UserMemberShip
    }>
  }
}
