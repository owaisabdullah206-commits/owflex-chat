import type { Metadata } from 'next'
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'
import { JsonLd, organizationSchema, SITE_URL } from '@/components/shared/JsonLd'
import './globals.css'

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
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
