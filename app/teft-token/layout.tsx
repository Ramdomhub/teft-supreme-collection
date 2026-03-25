import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.teftlegion.com"),
  title: "TEFT Gateway",
  description: "Enter the TEFT ecosystem",
  openGraph: {
    title: "TEFT Gateway",
    description: "Enter the TEFT ecosystem",
    url: "/teft-token",
    siteName: "TEFT",
    images: [
      {
        url: "/teft-preview.png", // Optimiert für Social Media (1,4 MB)
        width: 1200,
        height: 630,            // Ideales Format für X/Twitter
        alt: "TEFT Gateway",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image", // Sorgt für das große Vorschaubild
    title: "TEFT Gateway",
    description: "Enter the TEFT ecosystem",
    images: ["/teft-preview.png"], // Optimiert für X
  },
};

export default function TeftTokenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
