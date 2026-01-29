import 'fastify'

import { Club, Member } from '../generated/prisma/client'

declare module 'fastify' {
  export interface FastifyRequest {
    getCurrentUserId(): Promise<string>
    getUserMemberShip(slug: string): Promise<{ club: Club; memberShip: Member }>
  }
}
