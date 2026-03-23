"use client";

import { useEffect, useMemo, useState } from "react";

const TOKEN_MINT = "8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump";
const SOL_MINT = "So11111111111111111111111111111111111111112";

export default function TeftTokenPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const mobile =
      /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    setIsMobile(mobile);
  }, []);

  const phantomLink = useMemo(() => {
    return `https://phantom.com/tokens/solana/${TOKEN_MINT}`;
  }, []);

  const jupiterBase = useMemo(() => {
    return `https://jup.ag/swap?sell=${SOL_MINT}&buy=${TOKEN_MINT}`;
  }, []);

  const buyLinks = useMemo(
    () => [
      {
        label: "Buy 0.01 SOL",
        href: `${jupiterBase}&amount=0.01`,
      },
      {
        label: "Buy 0.05 SOL",
        href: `${jupiterBase}&amount=0.05`,
      },
      {
        label: "Buy 0.1 SOL",
        href: `${jupiterBase}&amount=0.1`,
      },
    ],
    [jupiterBase]
  );

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <img src="/teft.png" alt="TEFT" style={styles.image} />

        <div style={styles.eyebrow}>TEFT</div>
        <h1 style={styles.title}>Buy TEFT</h1>
        <p style={styles.subtitle}>Swap SOL → TEFT instantly.</p>

        <div style={styles.fomoWrap}>
          <div style={styles.fomoChip}>Momentum building</div>
          <div style={styles.fomoChip}>Price moving</div>
        </div>

        <div style={styles.buttonGrid}>
          {buyLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              style={styles.primaryButton}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div style={styles.secondaryWrap}>
          {isMobile ? (
            <a
              href={phantomLink}
              target="_blank"
              rel="noreferrer"
              style={styles.secondaryButton}
            >
              Open in Phantom
            </a>
          ) : (
            <a
              href={jupiterBase}
              target="_blank"
              rel="noreferrer"
              style={styles.secondaryButton}
            >
              Open in Jupiter
            </a>
          )}
        </div>

        <div style={styles.footerLinks}>
          <a
            href={phantomLink}
            target="_blank"
            rel="noreferrer"
            style={styles.footerLink}
          >
            Phantom
          </a>
          <span style={styles.dot}>•</span>
          <a
            href={jupiterBase}
            target="_blank"
            rel="noreferrer"
            style={styles.footerLink}
          >
            Jupiter
          </a>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#050505",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "460px",
    background: "#0d0d0d",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "20px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
  },
  image: {
    width: "100%",
    borderRadius: "18px",
    display: "block",
    marginBottom: "18px",
  },
  eyebrow: {
    fontSize: "12px",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    opacity: 0.55,
    marginBottom: "10px",
  },
  title: {
    fontSize: "34px",
    lineHeight: 1.05,
    margin: 0,
    marginBottom: "10px",
    fontWeight: 700,
  },
  subtitle: {
    margin: 0,
    opacity: 0.72,
    fontSize: "16px",
    lineHeight: 1.5,
    marginBottom: "16px",
  },
  fomoWrap: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "22px",
  },
  fomoChip: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    fontSize: "13px",
    opacity: 0.9,
  },
  buttonGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
    marginBottom: "14px",
  },
  primaryButton: {
    display: "block",
    textAlign: "center",
    padding: "15px 18px",
    borderRadius: "14px",
    background: "#ffffff",
    color: "#000000",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: "16px",
  },
  secondaryWrap: {
    marginBottom: "16px",
  },
  secondaryButton: {
    display: "block",
    textAlign: "center",
    padding: "14px 18px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.06)",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "15px",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  footerLinks: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    opacity: 0.6,
    fontSize: "14px",
  },
  footerLink: {
    color: "#ffffff",
    textDecoration: "none",
  },
  dot: {
    opacity: 0.4,
  },
};
