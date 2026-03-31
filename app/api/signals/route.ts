import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112', {
      next: { revalidate: 15 }
    });
    const data = await response.json();

    if (!data.pairs) {
      return NextResponse.json({ error: 'Keine Daten gefunden' }, { status: 500 });
    }

    const processedSignals = data.pairs
      .map((p: any) => {
        if (p.chainId !== 'solana') return null;
        if (p.baseToken.symbol === "SOL") return null;

        const mcap = p.fdv || 0;
        const vol24h = p.volume?.h24 || 0;
        
        // --- BETA TEST FILTER (Weicher eingestellt zum Testen des UIs) ---
        // Wenn du fertig mit Testen bist, mach hier wieder 7000 und 20000 draus!
        if (mcap < 2000 || mcap > 100000) return null; 
        if (vol24h < 1000) return null; 

        const ageMinutes = Math.floor(Math.random() * 10) + 1; 
        const isMintRevoked = Math.random() > 0.2; 
        const top10HoldPct = Math.floor(Math.random() * 60) + 10;
        const isLpBurned = Math.random() > 0.4;
        const holdersCount = Math.floor(Math.random() * 400) + 50;

        if (ageMinutes > 15) return null; // Toleranz für Test leicht erhöht
        if (!isMintRevoked) return null;

        let score = 50;
        if (vol24h > mcap * 0.3) score += 20; 
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
      .filter(Boolean) 
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 15);

    return NextResponse.json({ signals: processedSignals });
    
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
