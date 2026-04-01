import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const HELIUS_URL = process.env.NEXT_PUBLIC_HELIUS_RPC_URL;

export async function GET() {
  if (!HELIUS_URL) return NextResponse.json({ error: "HELIUS_KEY_MISSING" }, { status: 500 });

  try {
    const response = await fetch('https://api.dexscreener.com/latest/dex/search?q=pump', { cache: 'no-store' });
    const data = await response.json();
    if (!data.pairs) return NextResponse.json({ signals: [] });

    const now = Date.now();

    // 1. STRIKTER FILTER: Nur Solana, < 15 Min, < $100k MCap
    const rawSignals = data.pairs.filter((p: any) => {
      const ageMin = (now - p.pairCreatedAt) / 60000;
      const mcap = p.fdv || p.marketCap || 0;
      return p.chainId === 'solana' && ageMin > 0 && ageMin <= 15 && mcap <= 100000;
    }).slice(0, 10);

    // 2. HELIUS ENRICHMENT
    const signals = await Promise.all(rawSignals.map(async (p: any) => {
      try {
        const res = await fetch(HELIUS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0', id: 'teft', method: 'getAsset', params: { id: p.baseToken.address }
          })
        });
        const asset = await res.json();
        const result = asset.result;

        const isSafe = result?.authorities?.length === 0 || result?.authorities?.every((a: any) => a.scopes?.includes('owner'));
        
        return {
          name: result?.content?.metadata?.name || p.baseToken.name,
          ticker: result?.content?.metadata?.symbol || p.baseToken.symbol,
          address: p.baseToken.address,
          age: `${Math.floor((now - p.pairCreatedAt) / 60000)}m`,
          mcap: `$${Math.floor(p.fdv || p.marketCap).toLocaleString()}`,
          vol: `$${Math.floor(p.volume.h24).toLocaleString()}`,
          liq: `$${Math.floor(p.liquidity.usd).toLocaleString()}`,
          score: isSafe ? 98 : 65,
          dexUrl: p.url,
          image: result?.content?.links?.image || "",
          isSafe: isSafe
        };
      } catch (e) { return null; }
    }));

    return NextResponse.json({ signals: signals.filter(Boolean) });
  } catch (e) {
    return NextResponse.json({ error: "Fetch Error" }, { status: 500 });
  }
}
