import './globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  // Das hier ist wichtig, damit Next.js weiß, wo das Bild liegt
  metadataBase: new URL("https://www.teftlegion.com"), 
  title: 'TEFT Legion',
  description: 'Elite Solana Ecosystem',
  openGraph: {
    title: 'TEFT Legion',
    description: 'Gateway to Solana Alpha',
    url: 'https://www.teftlegion.com',
    siteName: 'TEFT Legion',
    images: [
      {
        url: '/teft-preview.png', // Dein Bild aus dem public-Ordner
        width: 1200,
        height: 630,
        alt: 'TEFT Preview',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image', // Das erzwingt das GROSSE Bild auf X
    title: 'TEFT Legion',
    description: 'Gateway to Solana Alpha',
    images: ['/teft-preview.png'], // Pfad zu deiner PNG
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#f5f5f5]">{children}</body>
    </html>
  )
}
