"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    Jupiter?: {
      init: (options: Record<string, unknown>) => void;
    };
  }
}

const TOKEN_MINT = "8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump";
const SOL_MINT = "So11111111111111111111111111111111111111112";

// Referral später ersetzen:
const REFERRAL_ACCOUNT = "REPLACE_WITH_YOUR_REFERRAL_ACCOUNT";
// Beispiel: 50 = 0.5%
const REFERRAL_FEE_BPS = 50;

export default function TeftTokenPage() {
  useEffect(() => {
    const initPlugin = () => {
      if (!window.Jupiter) return;

      window.Jupiter.init({
        displayMode: "integrated",
        integratedTargetId: "jupiter-plugin",
        enableWalletPassthrough: false,
        formProps: {
          initialInputMint: SOL_MINT,
          initialOutputMint: TOKEN_MINT,
          initialAmount: "0.01",
          fixedMint: "output",
          swapMode: "ExactIn",
          referralAccount:
            REFERRAL_ACCOUNT !== "REPLACE_WITH_YOUR_REFERRAL_ACCOUNT"
              ? REFERRAL_ACCOUNT
              : undefined,
          referralFee:
            REFERRAL_ACCOUNT !== "REPLACE_WITH_YOUR_REFERRAL_ACCOUNT"
              ? REFERRAL_FEE_BPS
              : undefined,
        },
      });
    };

    const onReady = () => initPlugin();

    if (window.Jupiter) {
      initPlugin();
    } else {
      window.addEventListener("load", onReady);
    }

    return () => {
      window.removeEventListener("load", onReady);
    };
  }, []);

  return (
    <>
      <Script
        src="https://plugin.jup.ag/plugin-v1.js"
        strategy="afterInteractive"
      />

      <main style={styles.page}>
        <div style={styles.card}>
          <img src="/teft.png" alt="TEFT" style={styles.image} />

          <div style={styles.header}>
            <h1 style={styles.title}>Buy TEFT</h1>
            <p style={styles.subtitle}>Swap SOL → TEFT</p>
          </div>

          <div style={styles.metaRow}>
            <span style={styles.metaChip}>0.01 SOL default</span>
            <span style={styles.metaChip}>Mobile ready</span>
            <span style={styles.metaChip}>Ultra swap</span>
          </div>

          <div id="jupiter-plugin" style={styles.pluginWrap} />

          <div style={styles.footer}>
            <span>Powered by Jupiter</span>
            <span style={styles.dot}>•</span>
            <span>TEFT</span>
          </div>
        </div>
      </main>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#ffffff",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "24px 16px 40px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  card: {
    width: "100%",
    maxWidth: 520,
    border: "1px solid #e6e6e6",
    borderRadius: 18,
    overflow: "hidden",
    background: "#fff",
  },
  image: {
    width: "100%",
    display: "block",
    aspectRatio: "1 / 1",
    objectFit: "cover",
    borderBottom: "1px solid #f0f0f0",
  },
  header: {
    padding: "16px 16px 8px",
  },
  title: {
    margin: 0,
    fontSize: 22,
    lineHeight: 1.1,
    fontWeight: 700,
    color: "#0f1419",
  },
  subtitle: {
    margin: "6px 0 0",
    fontSize: 14,
    color: "#536471",
  },
  metaRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    padding: "0 16px 16px",
  },
  metaChip: {
    fontSize: 12,
    color: "#536471",
    border: "1px solid #e6e6e6",
    borderRadius: 999,
    padding: "6px 10px",
    background: "#fff",
  },
  pluginWrap: {
    padding: "0 12px 12px",
  },
  footer: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    padding: "10px 16px 16px",
    fontSize: 12,
    color: "#536471",
  },
  dot: {
    opacity: 0.5,
  },
};
