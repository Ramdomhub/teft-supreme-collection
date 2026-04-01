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
        jsonrpc: '2.0',
        id: 'security-check',
        method: 'getAsset',
        params: { id: mint }
      })
    });
    const { result } = await res.json();
    
    // Sicherheitsparameter prüfen
    const isFreezeRevoked = result.authorities?.every((a: any) => a.scopes?.includes('owner')) || result.authorities?.length === 0;
    const hasSocials = result.content?.metadata?.extensions?.twitter || result.content?.metadata?.extensions?.telegram || result.content?.links?.external_url;

    // Whale Check (Top 10 Holders)
    const holderRes = await fetch(HELIUS_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'whale-check',
        method: 'getTokenLargestAccounts',
        params: [mint]
      })
    });
    const holderData = await holderRes.json();
    const topAccounts = holderData.result?.value || [];
    const totalSupply = result.token_info?.supply || 1;
    const top10Amount = topAccounts.slice(0, 10).reduce((acc: number, curr: any) => acc + parseInt(curr.amount), 0);
    const top10Percent = (top10Amount / totalSupply) * 100;

    return {
      isSafe: isFreezeRevoked && top10Percent < 40 && hasSocials,
      top10: top10Percent.toFixed(1),
      image: result.content?.links?.image || result.content?.metadata?.image || ""
    };
  } catch (e) {
    return { isSafe: false };
  }
}

export async function GET() {
  if (!HELIUS_URL) {
    return NextResponse.json({ error: "HELIUS_KEY_MISSING" }, { status: 500 });
  }

  try {
    const response = await fetch('https://api.dexscreener.com/latest/dex/search?q=pump', { cache: 'no-store' });
    const data = await response.json();
    if (!data.pairs) return NextResponse.json({ signals: [] });

    const now = Date.now();
    // Test-Filter: 15 Min Age, $5k - $100k MCap
    const rawSignals = data.pairs.filter((p: any) => {
      const ageMin = (now - p.pairCreatedAt) / 60000;
      const mcap = p.fdv || 0;
      const liq = p.liquidity?.usd || 0;
      return p.chainId === 'solana' && ageMin <= 15 && mcap >= 5000 && mcap <= 100000 && liq >= 2000;
    });

    const filteredSignals = await Promise.all(rawSignals.map(async (p: any) => {
      const security = await checkSecurity(p.baseToken.address);
      if (!security.isSafe) return null;

      return {
        name: p.baseToken.name,
        ticker: p.baseToken.symbol,
        address: p.baseToken.address,
        age: `${Math.floor((now - p.pairCreatedAt) / 60000)}m`,
        mcap: `$${Math.floor(p.fdv).toLocaleString()}`,
        vol: `$${Math.floor(p.volume.h24).toLocaleString()}`,
        liq: `$${Math.floor(p.liquidity.usd).toLocaleString()}`,
        score: Math.floor(Math.random() * 10) + 85,
        dexUrl: p.url,
        holders: `Top 10: ${security.top10}%`,
        image: security.image
      };
    }));

    return NextResponse.json({ signals: filteredSignals.filter(Boolean) });
  } catch (e) {
    return NextResponse.json({ error: "Fetch Error" }, { status: 500 });
  }
}
