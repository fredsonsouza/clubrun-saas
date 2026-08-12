import { ForbiddenError } from '@/http/routes/_errors/forbidden-error'
import { getUserPermissions } from '@/utils/get-user-permissions'
import type { AppAction, AppSubject } from '@saas/auth'
import type { FastifyRequest } from 'fastify'

export async function requireActiveMembership(
  request: FastifyRequest,
  slug: string
) {
  const context = await request.getUserMemberShip(slug)
  const userId = context.memberShip.userId
  const ability = getUserPermissions(
    userId,
    context.memberShip.role,
    context.memberShip.isSystemAdmin,
    context.memberShip.clubId ?? context.club.id,
    context.club.ownerId
  )

  return { ...context, userId, ability }
}

export type ClubAuthorizationContext = Awaited<
  ReturnType<typeof requireActiveMembership>
>

type ClubSubjectInput =
  | AppSubject
  | ({ __typename: Exclude<AppSubject, string>['__typename'] } & Record<
      string,
      unknown
    >)

function materializeSubject(
  context: ClubAuthorizationContext,
  input: ClubSubjectInput
) {
  if (typeof input !== 'string') return input

  if (input === 'Club') {
    return {
      __typename: 'Club' as const,
      id: context.club.id,
      ownerId: context.club.ownerId,
    }
  }

  return {
    __typename: input,
    id: `${context.club.id}:${input}`,
    clubId: context.club.id,
    athleteId: context.userId,
    userId: context.userId,
    authorId: context.userId,
    memberId: context.memberShip.id,
    visibility: 'PRIVATE' as const,
  }
}

export function requireClubAbility(
  context: ClubAuthorizationContext,
  action: AppAction,
  subject: ClubSubjectInput
): void {
  const resource = materializeSubject(context, subject)

  if (!context.ability.can(action as never, resource as never)) {
    throw new ForbiddenError(
      `Você não tem permissão para ${action} este recurso do clube.`
    )
  }
}
