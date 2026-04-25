import React from 'react'
import { auth } from '@/auth/auth'
import { redirect } from 'next/navigation'
import { CheckoutClient } from './checkout-client'

export default async function CheckoutPage() {
  const { user } = await auth()

  if (!user) {
    redirect('/auth/sign-in?callbackUrl=/checkout')
  }

  return <CheckoutClient user={user} />
}
