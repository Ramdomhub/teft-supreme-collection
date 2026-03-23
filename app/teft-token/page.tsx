"use client";

import { useState } from "react";

const TOKEN = "8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump";
const SOL = "So11111111111111111111111111111111111111112";

export default function Page() {
  const [amount, setAmount] = useState("0.01");

  const jupiter = `https://jup.ag/swap?sell=${SOL}&buy=${TOKEN}`;

  const preset = ["0.01", "0.05", "0.1"];

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <img src="/teft.png" style={styles.image} />

        <h1 style={styles.title}>Buy TEFT with SOL</h1>
        <p style={styles.subtitle}>
          Choose an amount or enter custom
        </p>

        {/* Preset Buttons */}
        <div style={styles.row}>
          {preset.map((p) => (
            <button
              key={p}
              onClick={() => setAmount(p)}
              style={{
                ...styles.pill,
                background: amount === p ? "#000" : "#f2f2f2",
                color: amount === p ? "#fff" : "#000",
              }}
            >
              {p} SOL
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div style={styles.inputRow}>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={styles.input}
            placeholder="Custom amount"
          />

          <a
            href={`${jupiter}&amount=${amount}`}
            target="_blank"
            style={styles.buy}
          >
            Buy TEFT
          </a>
        </div>

        <div style={styles.fomo}>
          <span>Live activity</span>
          <span>•</span>
          <span>Price moving</span>
        </div>
      </div>
    </main>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
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
    fontSize: 18,
    fontWeight: 600,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  row: {
    display: "flex",
    gap: 8,
    marginBottom: 12,
  },
  pill: {
    flex: 1,
    padding: "10px",
    borderRadius: 999,
    border: "none",
    fontWeight: 600,
    cursor: "pointer",
  },
  inputRow: {
    display: "flex",
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: 999,
    border: "1px solid #ddd",
  },
  buy: {
    padding: "10px 16px",
    borderRadius: 999,
    background: "#000",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 600,
  },
  fomo: {
    fontSize: 12,
    color: "#777",
    display: "flex",
    justifyContent: "center",
    gap: 6,
  },
};
