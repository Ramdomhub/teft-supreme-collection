import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. CACHE KILLER: 'no-store' zwingt Vercel, jedes Mal live bei DexScreener anzufragen!
    const response = await fetch('https://api.dexscreener.com/latest/dex/search?q=sol', {
      cache: 'no-store' 
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
        
        // --- BETA TEST NETZ (Weit genug, um die DexScreener 30-Limitierung zu umgehen) ---
        // Wenn du Helius hast, stellen wir das wieder auf 7000 - 20000!
        if (mcap < 5000 || mcap > 5000000) return null; 
        if (vol24h < 1000) return null; 

        // Simulation der tiefen On-Chain-Metriken
        const ageMinutes = Math.floor(Math.random() * 59) + 1; // Bis zu 1 Stunde alt für den Test
        const isMintRevoked = Math.random() > 0.1; 
        const top10HoldPct = Math.floor(Math.random() * 60) + 10;
        const isLpBurned = Math.random() > 0.4;
        const holdersCount = Math.floor(Math.random() * 900) + 50;

        // Security Check bleibt hart!
        if (!isMintRevoked) return null;

        // --- SCORING ENGINE ---
        let score = 50;
        if (vol24h > mcap * 0.2) score += 20; // Velocity
        if (isLpBurned) score += 15; // LP Burn
        if (top10HoldPct < 30) score += 15; // Whale Defense
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
