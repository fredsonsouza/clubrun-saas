import { mutationApi } from './api-client'

export async function revokeInvite({
  slug,
  inviteId,
}: {
  slug: string
  inviteId: string
}) {
  await mutationApi.delete(`clubs/${slug}/invites/${inviteId}`)
}
