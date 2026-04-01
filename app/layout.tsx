import './globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL("https://www.teftlegion.com"),
  title: 'TEFT Legion | Solana Alpha',
  description: 'The elite gateway to Solana trading and alpha signals.',
  openGraph: {
    title: 'TEFT Legion',
    description: 'Elite Solana Alpha Terminal.',
    url: '/',
    siteName: 'TEFT',
    // HIER IST DIE PNG
    images: [{ url: '/teft-preview.png', width: 1200, height: 630, alt: 'TEFT Legion Alpha Gateway' }],
    locale: 'de_DE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image', // Für das große Vorschaubild
    title: 'TEFT Legion | Solana Alpha',
    description: 'Elite Solana Alpha Terminal.',
    // HIER IST DIE PNG
    images: ['/teft-preview.png'],
    creator: '@TEFTofficial', // Passe deinen Handle an
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#0f1112]">{children}</body>
    </html>
  )
}
