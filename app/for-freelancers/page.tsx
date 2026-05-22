import type { Metadata } from 'next'
import ForFreelancersPage from '@/components/marketing/ForFreelancersPage'

export const metadata: Metadata = {
  title: 'For Freelancers — octively',
  description: 'Stop answering chatbot questions for your clients. Give them a portal instead.',
}

export default function Page() {
  return <ForFreelancersPage />
}
