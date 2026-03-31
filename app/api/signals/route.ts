import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Basis-Daten von DexScreener abrufen (Solana Token)
    const response = await fetch('https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112', {
      next: { revalidate: 15 } // Vercel Cache: Alle 15 Sekunden neu laden
    });
    const data = await response.json();

    if (!data.pairs) {
      return NextResponse.json({ error: 'Keine Daten gefunden' }, { status: 500 });
    }

    // 2. Die Degen-Filter Engine
    const processedSignals = data.pairs
      .filter((p: any) => p.baseToken.symbol !== "SOL") // Keine reinen SOL Paare
      .map((p: any) => {
        const mcap = p.fdv || 0;
        const vol24h = p.volume?.h24 || 0;
        const vol1h = p.volume?.h1 || 0;
        
        // --- SIMULIERTE ON-CHAIN DATEN (Für Helius/RPC Integration vorbereitet) ---
        // Alter in Minuten (Simuliert basierend auf Listen-Position für den Demo-Effekt)
        const ageMinutes = Math.floor(Math.random() * 15) + 1; 
        const isMintRevoked = Math.random() > 0.2; // 80% Chance auf "Safe"
        const top10HoldPct = Math.floor(Math.random() * 60) + 10; // 10% bis 70%
        const isLpBurned = Math.random() > 0.4; // 60% Chance auf Burned
        const holdersCount = Math.floor(Math.random() * 1000) + 50;

        // --- DER HARTE TÜRSTEHER (Aussortieren) ---
        if (mcap < 7000) return null; // MCap unter $7k? Müll.
        if (vol24h < 5000) return null; // Volumen unter $5k? Tot.
        if (ageMinutes > 10) return null; // Älter als 10 Min? Zu spät.
        if (!isMintRevoked) return null; // Mint nicht revoked? Rug-Gefahr.

        // --- SCORING LOGIK (0-99) ---
        let score = 50; // Basis-Score
        
        // 1. Organic Volume vs MCap Ratio
        if (vol1h > mcap * 0.2) score += 15; // Hohes Volumen = Action
        
        // 2. LP Burn Status
        if (isLpBurned) score += 15;
        
        // 3. Top Holder Check
        if (top10HoldPct < 30) score += 15; // Weit gestreut = Gut
        else if (top10HoldPct > 50) score -= 20; // Wal-Gefahr = Schlecht

        // Begrenzen auf maximal 99 und minimal 1
        score = Math.max(1, Math.min(99, score));

        return {
          name: p.baseToken.name,
          ticker: p.baseToken.symbol,
          age: `${ageMinutes} min`,
          mcapValue: mcap,
          mcap: `$${mcap.toLocaleString()}`,
          volValue: vol24h,
          vol: `$${vol24h.toLocaleString()}`,
          holders: holdersCount,
          score: score,
          status: score >= 80 ? "Strong" : "Watch",
          dexUrl: p.url,
          address: p.baseToken.address
        };
      })
      .filter(Boolean) // Alle "null" Werte (durch den Türsteher aussortiert) löschen
      .sort((a: any, b: any) => b.score - a.score) // Nach Score sortieren, höchste zuerst
      .slice(0, 15); // Nur die Top 15 an das Frontend schicken

    return NextResponse.json({ signals: processedSignals });
    
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
