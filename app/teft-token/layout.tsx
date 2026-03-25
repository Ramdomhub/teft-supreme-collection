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
        url: "/teft.png",
        width: 1200,
        height: 1200,
        alt: "TEFT Gateway",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TEFT Gateway",
    description: "Enter the TEFT ecosystem",
    images: ["/teft.png"],
  },
};

export default function TeftTokenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
