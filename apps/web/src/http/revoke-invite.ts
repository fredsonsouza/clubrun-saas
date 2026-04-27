import { api } from './api-client'

export async function revokeInvite({
  slug,
  inviteId,
}: {
  slug: string
  inviteId: string
}) {
  await api.delete(`clubs/${slug}/invites/${inviteId}`)
}
