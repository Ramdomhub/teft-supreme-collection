"use client";

import { useEffect, useMemo, useState } from "react";

const TOKEN_MINT = "8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump";
const SOL_MINT = "So11111111111111111111111111111111111111112";

export default function TeftTokenPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const mobile =
      /iPhone|iPad|iPod|Android/i.test(ua);
    setIsMobile(mobile);
  }, []);

  const phantomLink = `https://phantom.com/tokens/solana/${TOKEN_MINT}`;
  const jupiterBase = `https://jup.ag/swap?sell=${SOL_MINT}&buy=${TOKEN_MINT}`;

  const buyLinks = [
    { label: "Buy 0.01 SOL", href: `${jupiterBase}&amount=0.01` },
    { label: "Buy 0.05 SOL", href: `${jupiterBase}&amount=0.05` },
    { label: "Buy 0.1 SOL", href: `${jupiterBase}&amount=0.1` },
  ];

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <img src="/teft.png" style={styles.image} />

        <h1 style={styles.title}>Buy TEFT</h1>
        <p style={styles.subtitle}>Swap SOL → TEFT</p>

        <div style={styles.buttons}>
          {buyLinks.map((b) => (
            <a key={b.label} href={b.href} target="_blank" style={styles.primary}>
              {b.label}
            </a>
          ))}
        </div>

        <a
          href={isMobile ? phantomLink : jupiterBase}
          target="_blank"
          style={styles.secondary}
        >
          {isMobile ? "Open in Phantom" : "Open in Jupiter"}
        </a>

        <div style={styles.fomo}>
          <span>Momentum building</span>
          <span>•</span>
          <span>Price moving</span>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#ffffff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial',
  },
  card: {
    width: "100%",
    maxWidth: 420,
    border: "1px solid #e6e6e6",
    borderRadius: 16,
    padding: 16,
  },
  image: {
    width: "100%",
    borderRadius: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 600,
    margin: 0,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
  },
  buttons: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 12,
  },
  primary: {
    padding: "12px",
    background: "#000",
    color: "#fff",
    textAlign: "center",
    borderRadius: 999,
    textDecoration: "none",
    fontWeight: 600,
  },
  secondary: {
    display: "block",
    textAlign: "center",
    padding: "10px",
    borderRadius: 999,
    border: "1px solid #ddd",
    color: "#000",
    textDecoration: "none",
    marginBottom: 12,
  },
  fomo: {
    fontSize: 13,
    color: "#777",
    display: "flex",
    justifyContent: "center",
    gap: 6,
  },
};
