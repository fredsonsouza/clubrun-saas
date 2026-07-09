import { api } from './api-client'

interface CreateClubRequest {
  name: string
  domain?: string | null
  cnpj?: string | null
  shouldAttachUsersByDomain?: boolean
}

interface CreateClubResponse {
  clubId: string
}

export async function createClub({
  name,
  domain,
  cnpj,
  shouldAttachUsersByDomain,
}: CreateClubRequest) {
  const result = await api
    .post('clubs', {
      json: {
        name,
        domain,
        cnpj,
        shouldAttachUsersByDomain,
      },
    })
    .json<CreateClubResponse>()

  return result
}
