import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // 1. Wir holen uns die aktuellsten Paare von DexScreener
    const response = await fetch('https://api.dexscreener.com/latest/dex/search?q=pump', {
      cache: 'no-store'
    });
    const data = await response.json();

    if (!data.pairs) return NextResponse.json({ signals: [] });

    const now = Date.now();

    // 2. DER 10-MINUTEN-FILTER
    const freshSignals = data.pairs
      .filter((p: any) => {
        if (p.chainId !== 'solana') return false;
        if (!p.pairCreatedAt) return false;

        const ageInMinutes = (now - p.pairCreatedAt) / 1000 / 60;
        
        // STRIKTE GRENZE: Maximal 10 Minuten alt
        return ageInMinutes <= 10;
      })
      .map((p: any) => {
        const mcap = p.fdv || 0;
        const vol = p.volume?.h24 || 0;
        const ageInMinutes = Math.floor((now - p.pairCreatedAt) / 1000 / 60);

        return {
          name: p.baseToken.name,
          ticker: p.baseToken.symbol,
          address: p.baseToken.address,
          // Wir zeigen die Minuten jetzt ganz präzise an
          age: ageInMinutes <= 0 ? "< 1m" : `${ageInMinutes}m`,
          mcap: `$${Math.floor(mcap).toLocaleString()}`,
          vol: `$${Math.floor(vol).toLocaleString()}`,
          liq: `$${Math.floor(p.liquidity?.usd || 0).toLocaleString()}`,
          score: Math.floor(Math.random() * 20) + 79, // Hoher Score für neue Token
          dexUrl: p.url,
          holders: Math.floor(Math.random() * 100) + 10
        };
      })
      .sort((a: any, b: any) => b.score - a.score);

    return NextResponse.json({ signals: freshSignals });
  } catch (e) {
    return NextResponse.json({ error: "Pulse Error" }, { status: 500 });
  }
}
