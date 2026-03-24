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
    { label: "Swap via Phantom", href: LINKS.phantom },
    { label: "Get NFTs", href: LINKS.nfts },
    { label: "NFT Staking", href: LINKS.staking },
    { label: "View Project", href: LINKS.project },
  ];

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <img src="/teft.png" alt="TEFT" style={styles.image} />

        <div style={styles.content}>
          <h1 style={styles.title}>TEFT</h1>
          <p style={styles.subtitle}>Explore the ecosystem</p>

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
                    ...styles.actionBtn,
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
            <a href={LINKS.x} target="_blank" rel="noreferrer" style={styles.link}>
              X
            </a>
            <span style={styles.dot}>·</span>
            <a href={LINKS.site} target="_blank" rel="noreferrer" style={styles.link}>
              Site
            </a>
            <span style={styles.dot}>·</span>
            <a href={LINKS.tg} target="_blank" rel="noreferrer" style={styles.link}>
              Telegram
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
    padding: 16,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    border: "1px solid #eee",
    overflow: "hidden",
    background: "#fff",
  },
  image: {
    width: "100%",
    aspectRatio: "1 / 1",
    objectFit: "cover",
    display: "block",
  },
  content: {
    padding: 16,
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 600,
    letterSpacing: "-0.02em",
    color: "#111",
  },
  subtitle: {
    margin: "6px 0 16px",
    fontSize: 14,
    color: "#666",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 14,
  },
  actionBtn: {
    padding: "12px 10px",
    borderRadius: 14,
    background: "#f3f3f3",
    textAlign: "center",
    textDecoration: "none",
    color: "#111",
    fontSize: 13,
    fontWeight: 600,
    transition: "all 120ms ease",
    WebkitTapHighlightColor: "transparent",
  },
  meta: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    color: "#777",
    marginBottom: 8,
  },
  links: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    color: "#777",
  },
  link: {
    textDecoration: "none",
    color: "#777",
  },
  dot: {
    position: "relative",
    top: -1,
    opacity: 0.6,
  },
};
