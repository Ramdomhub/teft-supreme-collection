import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://teft-supreme-collection.vercel.app"),
  title: "TEFT",
  description: "Explore the ecosystem",
  openGraph: {
    title: "TEFT",
    description: "Explore the ecosystem",
    url: "/teft-token",
    siteName: "TEFT",
    images: [
      {
        url: "/teft.png",
        width: 1200,
        height: 1200,
        alt: "TEFT",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TEFT",
    description: "Explore the ecosystem",
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
