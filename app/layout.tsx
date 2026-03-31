import "./globals.css";

export const metadata = {
  title: "TEFT Gateway",
  description: "Explore the TEFT ecosystem",
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
