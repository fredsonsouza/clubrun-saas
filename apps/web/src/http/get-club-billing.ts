import { api } from './api-client'

interface GetClubBillingResponse {
  billing: {
    seats: {
      amount: number
      unit: number
      price: number
    }
    total: number
  }
}

export async function getClubBilling(slug: string) {
  const result = await api
    .get(`clubs/${slug}/billing`)
    .json<GetClubBillingResponse>()

  return result
}
