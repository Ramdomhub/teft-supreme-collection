"use client";

import { useState } from "react";

const TOKEN = "8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump";
const PHANTOM = `https://phantom.com/tokens/solana/${TOKEN}`;

export default function Page() {
  const [pressed, setPressed] = useState<string | null>(null);

  const buttons = ["Buy 0.01", "Buy 0.05", "Buy 0.1"];

  const pressIn = (key: string) => setPressed(key);
  const pressOut = () => setPressed(null);

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <img src="/teft.png" alt="TEFT" style={styles.image} />

        <h1 style={styles.title}>Buy TEFT</h1>
        <p style={styles.subtitle}>Open TEFT directly in Phantom.</p>

        <div style={styles.row}>
          {buttons.map((label) => {
            const key = `pill-${label}`;
            const isPressed = pressed === key;

            return (
              <a
                key={label}
                href={PHANTOM}
                target="_blank"
                rel="noreferrer"
                onMouseDown={() => pressIn(key)}
                onMouseUp={pressOut}
                onMouseLeave={pressOut}
                onTouchStart={() => pressIn(key)}
                onTouchEnd={pressOut}
                style={{
                  ...styles.pill,
                  transform: isPressed ? "scale(0.97)" : "scale(1)",
                  opacity: isPressed ? 0.88 : 1,
                }}
              >
                {label}
              </a>
            );
          })}
        </div>

        <p style={styles.note}>Amount selected in Phantom</p>

        <a
          href={PHANTOM}
          target="_blank"
          rel="noreferrer"
          onMouseDown={() => pressIn("main")}
          onMouseUp={pressOut}
          onMouseLeave={pressOut}
          onTouchStart={() => pressIn("main")}
          onTouchEnd={pressOut}
          style={{
            ...styles.buy,
            transform: pressed === "main" ? "scale(0.985)" : "scale(1)",
            opacity: pressed === "main" ? 0.92 : 1,
          }}
        >
          Open in Phantom
        </a>

        <div style={styles.footer}>
          <span>Mobile ready</span>
          <span style={styles.dot}>·</span>
          <span>Neutral wallet flow</span>
        </div>

        <div style={styles.footer}>
          <a
            href="https://x.com/DEIN_ACCOUNT"
            target="_blank"
            rel="noreferrer"
            style={styles.footerLink}
          >
            X
          </a>
          <span style={styles.dot}>·</span>
          <a
            href="https://deine-seite.com"
            target="_blank"
            rel="noreferrer"
            style={styles.footerLink}
          >
            Site
          </a>
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
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  card: {
    width: "100%",
    maxWidth: 420,
    border: "1px solid #e8e8e8",
    borderRadius: 20,
    padding: 16,
    background: "#fff",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  image: {
    width: "100%",
    borderRadius: 14,
    marginBottom: 14,
    display: "block",
  },
  title: {
    fontSize: 22,
    lineHeight: 1.1,
    fontWeight: 700,
    margin: 0,
    marginBottom: 6,
    color: "#000",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 1.4,
    color: "#5f6368",
    margin: 0,
    marginBottom: 16,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 10,
    marginBottom: 10,
  },
  pill: {
    padding: "11px 8px",
    background: "#f3f3f3",
    color: "#000",
    textAlign: "center",
    borderRadius: 999,
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 13,
    transition: "transform 120ms ease, opacity 120ms ease, background 120ms ease",
    WebkitTapHighlightColor: "transparent",
  },
  note: {
    fontSize: 12,
    color: "#8b8b8b",
    textAlign: "center",
    margin: 0,
    marginBottom: 14,
  },
  buy: {
    display: "block",
    textAlign: "center",
    padding: "14px 16px",
    background: "#000",
    color: "#fff",
    borderRadius: 999,
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 16,
    marginBottom: 16,
    transition: "transform 120ms ease, opacity 120ms ease",
    WebkitTapHighlightColor: "transparent",
  },
  footer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    color: "#7b7b7b",
    marginTop: 6,
  },
  footerLink: {
    color: "#7b7b7b",
    textDecoration: "none",
  },
  dot: {
    position: "relative",
    top: -1,
    opacity: 0.7,
  },
};
