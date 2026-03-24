"use client";

const TOKEN = "8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump";
const PHANTOM = `https://phantom.com/tokens/solana/${TOKEN}`;

export default function Page() {
  const buttons = ["Buy 0.01 SOL", "Buy 0.05 SOL", "Buy 0.1 SOL"];

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <img src="/teft.png" alt="TEFT" style={styles.image} />

        <h1 style={styles.title}>Buy TEFT</h1>
        <p style={styles.subtitle}>Open TEFT directly in Phantom.</p>

        <div style={styles.row}>
          {buttons.map((label) => (
            <a
              key={label}
              href={PHANTOM}
              target="_blank"
              rel="noreferrer"
              style={styles.pill}
            >
              {label}
            </a>
          ))}
        </div>

        <a
          href={PHANTOM}
          target="_blank"
          rel="noreferrer"
          style={styles.buy}
        >
          Open in Phantom
        </a>

        <div style={styles.fomo}>
          <span>Mobile ready</span>
          <span>•</span>
          <span>Neutral wallet flow</span>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#fff",
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
    border: "1px solid #e6e6e6",
    borderRadius: 16,
    padding: 16,
    background: "#fff",
  },
  image: {
    width: "100%",
    borderRadius: 12,
    marginBottom: 12,
    display: "block",
  },
  title: {
    fontSize: 20,
    fontWeight: 600,
    margin: 0,
    marginBottom: 4,
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    margin: 0,
    marginBottom: 16,
  },
  row: {
    display: "flex",
    gap: 8,
    marginBottom: 12,
  },
  pill: {
    flex: 1,
    padding: "10px 6px",
    background: "#f2f2f2",
    color: "#000",
    textAlign: "center",
    borderRadius: 999,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 13,
  },
  buy: {
    display: "block",
    textAlign: "center",
    padding: "12px",
    background: "#000",
    color: "#fff",
    borderRadius: 999,
    textDecoration: "none",
    fontWeight: 600,
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
