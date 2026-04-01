import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const HELIUS_URL = process.env.NEXT_PUBLIC_HELIUS_RPC_URL;

async function getHeliusData(mint: string) {
  try {
    const res = await fetch(HELIUS_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 'teft', method: 'getAsset', params: { id: mint }
      })
    });
    const { result } = await res.json();
    return {
      image: result.content?.links?.image || result.content?.metadata?.image || "",
      twitter: result.content?.metadata?.extensions?.twitter || result.content?.links?.external_url || "",
      telegram: result.content?.metadata?.extensions?.telegram || ""
    };
  } catch { return { image: "", twitter: "", telegram: "" }; }
}

export async function GET() {
  try {
    const res = await fetch('https://api.dexscreener.com/latest/dex/search?q=pump', { cache: 'no-store' });
    const data = await res.json();
    const now = Date.now();

    const filtered = data.pairs
      .filter((p: any) => p.chainId === 'solana' && (p.fdv || 0) < 750000)
      .slice(0, 10);

    const signals = await Promise.all(filtered.map(async (p: any) => {
      const h = await getHeliusData(p.baseToken.address);
      const age = Math.floor((now - p.pairCreatedAt) / 60000);
      return {
        name: p.baseToken.name,
        ticker: p.baseToken.symbol,
        address: p.baseToken.address,
        age: `${age}m`,
        mcap: `$${Math.floor(p.fdv || 0).toLocaleString()}`,
        score: Math.floor(Math.random() * 30) + 70, // Platzhalter für deine Logik
        image: h.image,
        twitter: h.twitter,
        telegram: h.telegram,
        isSafe: true
      };
    }));

    return NextResponse.json({ signals });
  } catch { return NextResponse.json({ signals: [] }); }
}
