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
        // 1. ABSOLUTE GRUNDBEDINGUNGEN (Nur Solana, Kein reines SOL)
        if (p.chainId !== 'solana') return null;
        if (p.baseToken.symbol === "SOL") return null;

        const mcap = p.fdv || 0;
        const vol24h = p.volume?.h24 || 0;
        
        // --- DER HARTE TEFT-TÜRSTEHER ---
        // Exaktes Fenster: Nur zwischen $7k und $20k MCap
        if (mcap < 7000 || mcap > 20000) return null; 
        
        // Volumen muss über $5k liegen (Action-Check)
        if (vol24h < 5000) return null; 

        // --- SIMULIERTE DEGEN-METRIKEN (Für Helius-Integration später) ---
        const ageMinutes = Math.floor(Math.random() * 10) + 1; // Max 10 Min
        const isMintRevoked = Math.random() > 0.2; 
        const top10HoldPct = Math.floor(Math.random() * 60) + 10;
        const isLpBurned = Math.random() > 0.4;
        const holdersCount = Math.floor(Math.random() * 400) + 50;

        // Harter Alters- und Sicherheits-Check
        if (ageMinutes > 10) return null;
        if (!isMintRevoked) return null;

        // --- SCORING LOGIK (0-99) ---
        let score = 50;
        
        // Volumen/MCap Ratio (Bei Micro-Caps extrem wichtig)
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
      .filter(Boolean) // Wirft alle 'null' raus
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 15);

    return NextResponse.json({ signals: processedSignals });
    
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
