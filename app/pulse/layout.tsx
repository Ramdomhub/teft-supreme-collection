import { Metadata } from 'next'

export const metadata: Metadata = {
  // SPEZIFISCHER TITEL FÜR PULSE
  title: 'TEFT Pulse | Live Alpha Terminal',
  description: 'Live High-Conviction Solana Signals.',
  openGraph: {
    title: 'TEFT Pulse | Live Alpha Terminal',
    description: 'Real-time Solana sniping & analysis engine.',
    url: '/pulse',
    siteName: 'TEFT Legion',
    // HIER IST DIE PNG FÜR PULSE
    images: [{ url: '/teft-preview.png', width: 1200, height: 630, alt: 'TEFT Pulse Alpha Terminal' }],
    locale: 'de_DE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TEFT Pulse | Live Alpha Terminal',
    description: 'Real-time Solana sniping & analysis engine.',
    // HIER IST DIE PNG FÜR PULSE
    images: ['/teft-preview.png'],
  },
}

export default function PulseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
