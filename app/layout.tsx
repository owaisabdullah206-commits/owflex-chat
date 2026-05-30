import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Source_Serif_4, JetBrains_Mono } from 'next/font/google'
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'
import { JsonLd, organizationSchema, SITE_URL } from '@/components/shared/JsonLd'
import './globals.css'

// ── Fonts (self-hosted via next/font — no FOUT, no layout shift) ──────────────
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-source-serif',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'White Label AI Chatbot Platform for Agencies & Freelancers — Octively',
    template: '%s — Octively',
  },
  description:
    'The easiest white-label AI chatbot platform for freelancers and agencies. Build AI chatbots for your SMB clients in minutes. Each client gets their own branded portal to view conversations, leads, and analytics. Free plan available.',
  applicationName: 'Octively',
  openGraph: {
    siteName: 'Octively',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@octively',
  },
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'nGDKGrJoZ6o0uJhb1Q9qXy-WH57whMuNkcXHaUalR_E',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${sourceSerif.variable} ${mono.variable}`}>
        <JsonLd schema={organizationSchema} />
        {children}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
        )}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  )
}
