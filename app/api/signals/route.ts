import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // GEHEIMWAFFE: Wir suchen jetzt nach frischen 'pump' Token (Pump.fun Launches auf Solana)
    const response = await fetch('https://api.dexscreener.com/latest/dex/search?q=pump', {
      next: { revalidate: 15 }
    });
    const data = await response.json();

    if (!data.pairs) {
      return NextResponse.json({ error: 'Keine Daten gefunden' }, { status: 500 });
    }

    const processedSignals = data.pairs
      .map((p: any) => {
        // 1. ABSOLUTER SCHUTZ: Nur native Solana Token!
        if (p.chainId !== 'solana') return null;

        const mcap = p.fdv || 0;
        const vol24h = p.volume?.h24 || 0;
        
        // 2. DER TÜRSTEHER (Minimal angepasst für echte Ergebnisse)
        // Wir fischen im 5k bis 50k Becken (Echte Degen-Size)
        if (mcap < 5000 || mcap > 50000) return null; 
        if (vol24h < 1000) return null; // Tote Coins fliegen raus

        // 3. ON-CHAIN SIMULATION (Für späteres Helius-Backend)
        const ageMinutes = Math.floor(Math.random() * 10) + 1; // Max 10 Min alt
        const isMintRevoked = Math.random() > 0.1; // 90% Wahrscheinlichkeit auf Safe
        const top10HoldPct = Math.floor(Math.random() * 60) + 10;
        const isLpBurned = Math.random() > 0.4;
        const holdersCount = Math.floor(Math.random() * 400) + 50;

        // Harter Alters- und Sicherheits-Check
        if (ageMinutes > 10) return null;
        if (!isMintRevoked) return null;

        // 4. ENGINE SCORING (0-99)
        let score = 50;
        
        // Volumen/MCap Ratio (Extrem wichtig für Micro-Caps)
        if (vol24h > mcap * 0.5) score += 20; 
        if (isLpBurned) score += 15;
        if (top10HoldPct < 30) score += 15;
        else if (top10HoldPct > 50) score -= 20;

        score = Math.max(1, Math.min(99, score));

        return {
          name: p.baseToken.name,
          ticker: p.baseToken.symbol,
          age: `${ageMinutes} min`,
          mcap: `$${mcap.toLocaleString()}`,
          vol: `$${vol24h.toLocaleString()}`,
          holders: holdersCount,
          score: score,
          status: score >= 80 ? "Strong" : "Watch",
          dexUrl: p.url
        };
      })
      .filter(Boolean) // Schmeißt alle geblockten Token endgültig weg
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 15);

    return NextResponse.json({ signals: processedSignals });
    
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
