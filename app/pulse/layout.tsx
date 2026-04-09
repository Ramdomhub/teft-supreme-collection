import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TEFT Oracle | Live Alpha Terminal',
  description: 'Real-time Solana wallet intelligence. See what others don\'t.',
  openGraph: {
    title: 'TEFT Oracle | Live Alpha Terminal',
    description: 'Real-time Solana sniping & wallet intelligence engine.',
    url: '/pulse',
    siteName: 'TEFT Legion',
    images: [{ url: '/teft-preview.png', width: 1200, height: 630, alt: 'TEFT Oracle Alpha Terminal' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TEFT Oracle | Live Alpha Terminal',
    description: 'Real-time Solana sniping & wallet intelligence engine.',
    images: ['/teft-preview.png'],
  },
}

export default function PulseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
