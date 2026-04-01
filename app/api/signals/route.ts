import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const HELIUS_URL = process.env.NEXT_PUBLIC_HELIUS_RPC_URL;

async function checkSecurity(mint: string) {
  try {
    const res = await fetch(HELIUS_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 'teft', method: 'getAsset', params: { id: mint }
      })
    });
    const { result } = await res.json();
    
    const isFreezeRevoked = result.authorities?.every((a: any) => a.scopes?.includes('owner')) || result.authorities?.length === 0;
    const hasSocials = !!(result.content?.metadata?.extensions?.twitter || result.content?.metadata?.extensions?.telegram || result.content?.links?.external_url);

    const holderRes = await fetch(HELIUS_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 'whale', method: 'getTokenLargestAccounts', params: [mint]
      })
    });
    const holderData = await holderRes.json();
    const topAccounts = holderData.result?.value || [];
    const totalSupply = result.token_info?.supply || 1;
    const top10Amount = topAccounts.slice(0, 10).reduce((acc: number, curr: any) => acc + parseInt(curr.amount), 0);
    const top10Percent = (top10Amount / totalSupply) * 100;

    return {
      isFreezeSafe: isFreezeRevoked,
      isWhaleSafe: top10Percent < 35,
      hasSocials: hasSocials,
      top10: top10Percent.toFixed(1),
      image: result.content?.links?.image || result.content?.metadata?.image || ""
    };
  } catch (e) {
    return { isFreezeSafe: false, isWhaleSafe: false, hasSocials: false, top10: "??", image: "" };
  }
}

export async function GET() {
  if (!HELIUS_URL) return NextResponse.json({ error: "HELIUS_KEY_MISSING" }, { status: 500 });

  try {
    const response = await fetch('https://api.dexscreener.com/latest/dex/search?q=pump', { cache: 'no-store' });
    const data = await response.json();
    if (!data.pairs) return NextResponse.json({ signals: [] });

    const now = Date.now();
    // Wir nehmen die 15 neuesten Paare, egal wie alt (bis 60 Min)
    const rawSignals = data.pairs
      .filter((p: any) => p.chainId === 'solana')
      .slice(0, 15);

    const signals = await Promise.all(rawSignals.map(async (p: any) => {
      const sec = await checkSecurity(p.baseToken.address);
      
      return {
        name: p.baseToken.name,
        ticker: p.baseToken.symbol,
        address: p.baseToken.address,
        age: `${Math.floor((now - p.pairCreatedAt) / 60000)}m`,
        mcap: `$${Math.floor(p.fdv || 0).toLocaleString()}`,
        vol: `$${Math.floor(p.volume?.h24 || 0).toLocaleString()}`,
        liq: `$${Math.floor(p.liquidity?.usd || 0).toLocaleString()}`,
        score: sec.isFreezeSafe && sec.hasSocials ? 95 : 65,
        dexUrl: p.url,
        holders: `Top 10: ${sec.top10}%`,
        image: sec.image,
        isSafe: sec.isFreezeSafe && sec.hasSocials
      };
    }));

    return NextResponse.json({ signals });
  } catch (e) {
    return NextResponse.json({ error: "Fetch Error" }, { status: 500 });
  }
}
