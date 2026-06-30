import type { Metadata } from 'next'
import AffiliateLandingPage from '@/components/affiliate/AffiliateLandingPage'

export const metadata: Metadata = {
  title: 'Affiliate Program — Earn by Referring Octively',
  description:
    'Join the Octively affiliate program. Earn commission for every customer you refer. Get your coupon code, share it, and earn monthly payouts.',
}

export default function Page() {
  return <AffiliateLandingPage />
}
