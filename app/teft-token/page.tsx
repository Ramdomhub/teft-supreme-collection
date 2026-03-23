export default function Page() {
  const jupiterLink =
    "https://jup.ag/swap?sell=So11111111111111111111111111111111111111112&buy=8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        textAlign: "center",
      }}
    >
      <img
        src="/teft.png"
        alt="TEFT"
        style={{
          width: "100%",
          maxWidth: 400,
          borderRadius: 16,
          marginBottom: 24,
        }}
      />

      <h1 style={{ fontSize: 32, fontWeight: "bold" }}>
        Buy TEFT
      </h1>

      <p style={{ opacity: 0.7, marginBottom: 24 }}>
        Swap SOL → TEFT instantly.
      </p>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <a
          href={jupiterLink}
          target="_blank"
          style={buttonStyle}
        >
          Buy
        </a>
      </div>

      {/* Secondary CTA */}
      <a
        href={jupiterLink}
        target="_blank"
        style={{
          opacity: 0.6,
          fontSize: 14,
        }}
      >
        Open in Jupiter →
      </a>
    </main>
  );
}

const buttonStyle = {
  padding: "14px 24px",
  background: "#ffffff",
  color: "#000",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: "bold",
};
