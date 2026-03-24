import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TEFT Supreme",
  description: "Inside X.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
