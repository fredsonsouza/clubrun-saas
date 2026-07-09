import { api } from './api-client'

interface GetInviteLinkResponse {
  inviteLink: string
}

export async function getInviteLink(
  slug: string
): Promise<GetInviteLinkResponse> {
  return await api
    .get(`clubs/${slug}/invite-link`)
    .json<GetInviteLinkResponse>()
}
