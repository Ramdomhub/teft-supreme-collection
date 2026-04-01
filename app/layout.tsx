import './globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL("https://www.teftlegion.com"),
  title: 'TEFT Legion',
  description: 'Gateway to Solana Alpha',
  openGraph: {
    title: 'TEFT Legion',
    description: 'Gateway to Solana Alpha',
    url: '/',
    siteName: 'TEFT Legion',
    images: [{ url: '/teft-preview.png', width: 1200, height: 630 }], // DEINE PNG
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image', // WICHTIG: Erzeugt das große Bild auf X
    title: 'TEFT Legion',
    images: ['/teft-preview.png'], // DEINE PNG
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f5f5f5]">{children}</body>
    </html>
  )
}
