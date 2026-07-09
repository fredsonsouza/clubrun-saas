import { api } from './api-client'

interface GetSystemBillingResponse {
  billing: {
    mrr: number
    b2bRevenue: number
    b2cRevenue: number
    availableBalance: number
    transactions: Array<{
      id: string
      entity: string
      type: string
      amount: number
      date: string
      status: string
    }>
  }
}

export async function getSystemBilling(): Promise<GetSystemBillingResponse> {
  const result = await api
    .get('system/billing')
    .json<GetSystemBillingResponse>()
  return result
}
