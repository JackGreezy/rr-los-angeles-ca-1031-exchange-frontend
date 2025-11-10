import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyCTA from '@/components/StickyCTA'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Los Angeles NNN Lease Property Experts | Triple Net Lease Investments',
    template: '%s | 1031 Exchange Los Angeles',
  },
  description: 'Expert triple net lease property identification connecting Los Angeles CA investors with credit-rated corporate tenants and passive income opportunities. Investment-grade NNN lease properties with guaranteed monthly cash flow.',
  keywords: 'NNN lease, triple net lease, Los Angeles, passive income, commercial real estate, credit tenants, property investment, 1031 exchange, NNN properties',
  authors: [{ name: '1031 Exchange Los Angeles' }],
  creator: '1031 Exchange Los Angeles',
  publisher: '1031 Exchange Los Angeles',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.1031exchangelosangeles.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon/favicon.ico',
    shortcut: '/favicon/favicon.ico',
    apple: '/favicon/apple-touch-icon.png',
    other: [
      {
        rel: 'icon',
        url: '/favicon/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        rel: 'icon',
        url: '/favicon/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        rel: 'android-chrome',
        url: '/favicon/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        rel: 'android-chrome',
        url: '/favicon/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
  openGraph: {
    title: 'Los Angeles NNN Lease Property Experts | Triple Net Lease Investments',
    description: 'Expert triple net lease property identification connecting Los Angeles CA investors with credit-rated corporate tenants and passive income opportunities.',
    url: 'https://www.1031exchangelosangeles.com/',
    siteName: '1031 Exchange Los Angeles',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Los Angeles NNN Lease Property Experts',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Los Angeles NNN Lease Property Experts | Triple Net Lease Investments',
    description: 'Expert triple net lease property identification connecting Los Angeles CA investors with credit-rated corporate tenants and passive income opportunities.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification-code',
  },
  category: 'Real Estate Investment',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <StickyCTA />
        <Analytics />
      </body>
    </html>
  )
}
