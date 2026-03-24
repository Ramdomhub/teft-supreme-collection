"use client";

import { useState } from "react";

const LINKS = {
  phantom:
    "https://phantom.com/tokens/solana/8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump",
  nfts: "https://magiceden.io/marketplace/teft_supreme",
  staking: "https://www.solsuite.io/teftsupreme",
  x: "https://x.com/TEFTofficial",
  site: "https://www.teftlegion.io",
  project: "https://www.teftlegion.io/blank-6",
  tg: "https://t.me/teftlegionofficial",
};

export default function Page() {
  const [pressed, setPressed] = useState<string | null>(null);

  const pressIn = (key: string) => setPressed(key);
  const pressOut = () => setPressed(null);

  const actions = [
    { label: "Swap via Phantom", href: LINKS.phantom, primary: true },
    { label: "Get NFTs", href: LINKS.nfts },
    { label: "NFT Staking", href: LINKS.staking },
    { label: "View Project", href: LINKS.project },
  ];

  return (
    <main style={styles.page}>
      <div style={styles.frame}>
        <div style={styles.card}>
          <img src="/teft.png" alt="TEFT" style={styles.image} />

          <div style={styles.content}>
            <h1 style={styles.title}>TEFT</h1>
            <p style={styles.subtitle}>Access the TEFT ecosystem</p>

            <div style={styles.grid}>
              {actions.map((btn, i) => {
                const key = `btn-${i}`;
                const isPressed = pressed === key;

                return (
                  <a
                    key={btn.label}
                    href={btn.href}
                    target="_blank"
                    rel="noreferrer"
                    onMouseDown={() => pressIn(key)}
                    onMouseUp={pressOut}
                    onMouseLeave={pressOut}
                    onTouchStart={() => pressIn(key)}
                    onTouchEnd={pressOut}
                    style={{
                      ...(btn.primary
                        ? styles.primaryActionBtn
                        : styles.actionBtn),
                      transform: isPressed ? "scale(0.97)" : "scale(1)",
                      opacity: isPressed ? 0.9 : 1,
                    }}
                  >
                    {btn.label}
                  </a>
                );
              })}
            </div>

            <div style={styles.meta}>
              <span>Mobile ready</span>
              <span style={styles.dot}>·</span>
              <span>Phantom supported</span>
            </div>

            <div style={styles.links}>
              <a
                href={LINKS.x}
                target="_blank"
                rel="noreferrer"
                style={styles.link}
              >
                X
              </a>
              <span style={styles.dot}>·</span>
              <a
                href={LINKS.site}
                target="_blank"
                rel="noreferrer"
                style={styles.link}
              >
                www.teftlegion.io
              </a>
              <span style={styles.dot}>·</span>
              <a
                href={LINKS.tg}
                target="_blank"
                rel="noreferrer"
                style={styles.link}
              >
                Telegram
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const baseButton: React.CSSProperties = {
  padding: "13px 12px",
  borderRadius: 16,
  textAlign: "center",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 650,
  transition: "all 120ms ease",
  WebkitTapHighlightColor: "transparent",
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#050506",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },

  // äußerer, sichtbarer Blink-Rahmen
  frame: {
    width: "100%",
    maxWidth: 452,
    borderRadius: 30,
    padding: 6, // <- macht den Rand sichtbar dick
    background: "rgba(255,255,255,0.18)",
    boxShadow: `
      0 0 0 2px rgba(255,255,255,0.08),
      0 0 0 8px rgba(255,255,255,0.025),
      0 18px 60px rgba(0,0,0,0.72),
      0 0 28px rgba(255,255,255,0.12)
    `,
  },

  card: {
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
    background: "#ffffff",
  },

  image: {
    width: "100%",
    aspectRatio: "1 / 1",
    objectFit: "cover",
    display: "block",
    borderBottom: "1px solid #eeeeee",
  },

  content: {
    padding: 18,
  },

  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: "-0.03em",
    color: "#111111",
  },

  subtitle: {
    margin: "8px 0 18px",
    fontSize: 15,
    color: "#5f6368",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 16,
  },

  primaryActionBtn: {
    ...baseButton,
    background: "#111111",
    color: "#ffffff",
  },

  actionBtn: {
    ...baseButton,
    background: "#f3f3f3",
    color: "#111111",
  },

  meta: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    color: "#888888",
    marginBottom: 10,
  },

  links: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    color: "#666666",
    flexWrap: "wrap",
  },

  link: {
    textDecoration: "none",
    color: "#444444",
    fontWeight: 500,
  },

  dot: {
    opacity: 0.5,
  },
};
