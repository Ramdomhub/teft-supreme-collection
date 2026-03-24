"use client";

import { useState } from "react";

const TOKEN = "8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump";
const PHANTOM = `https://phantom.com/tokens/solana/${TOKEN}`;

export default function Page() {
  const [pressed, setPressed] = useState<string | null>(null);

  const buttons = ["0.01", "0.05", "0.1"];

  const pressIn = (key: string) => setPressed(key);
  const pressOut = () => setPressed(null);

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <img src="/teft.png" alt="TEFT" style={styles.image} />

        <div style={styles.content}>
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
                    opacity: isPressed ? 0.9 : 1,
                  }}
                >
                  {label} SOL
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
              opacity: pressed === "main" ? 0.93 : 1,
            }}
          >
            Open in Phantom
          </a>

          <div style={styles.meta}>
            <span>Mobile ready</span>
            <span style={styles.dot}>·</span>
            <span>Neutral wallet flow</span>
          </div>

          <div style={styles.social}>
            <a
              href="https://x.com/DEIN_ACCOUNT"
              target="_blank"
              rel="noreferrer"
              style={styles.socialLink}
            >
              X
            </a>
            <span style={styles.dot}>·</span>
            <a
              href="https://deine-seite.com"
              target="_blank"
              rel="noreferrer"
              style={styles.socialLink}
            >
              Site
            </a>
          </div>
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
    padding: "20px 16px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  card: {
    width: "100%",
    maxWidth: 430,
    background: "#fff",
    border: "1px solid #ececec",
    borderRadius: 24,
    overflow: "hidden",
    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
  },
  image: {
    width: "100%",
    display: "block",
    aspectRatio: "1 / 1",
    objectFit: "cover",
  },
  content: {
    padding: "18px 16px 20px",
  },
  title: {
    margin: 0,
    fontSize: 24,
    lineHeight: 1.05,
    fontWeight: 750,
    color: "#0b0b0b",
    letterSpacing: "-0.03em",
  },
  subtitle: {
    margin: "8px 0 18px",
    fontSize: 14,
    lineHeight: 1.4,
    color: "#6d6d6d",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 10,
    marginBottom: 10,
  },
  pill: {
    background: "#f3f3f3",
    color: "#111",
    textDecoration: "none",
    textAlign: "center",
    padding: "12px 8px",
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 650,
    transition: "transform 120ms ease, opacity 120ms ease",
    WebkitTapHighlightColor: "transparent",
  },
  note: {
    margin: "0 0 16px",
    textAlign: "center",
    fontSize: 12,
    color: "#9a9a9a",
  },
  buy: {
    display: "block",
    textAlign: "center",
    textDecoration: "none",
    background: "#000",
    color: "#fff",
    padding: "15px 16px",
    borderRadius: 999,
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 18,
    transition: "transform 120ms ease, opacity 120ms ease",
    WebkitTapHighlightColor: "transparent",
  },
  meta: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    color: "#7f7f7f",
    marginBottom: 8,
  },
  social: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    color: "#7f7f7f",
  },
  socialLink: {
    color: "#7f7f7f",
    textDecoration: "none",
  },
  dot: {
    position: "relative",
    top: -1,
    opacity: 0.7,
  },
};
