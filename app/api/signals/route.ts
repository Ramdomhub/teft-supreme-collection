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
    
    // Check 1: Socials
    const twitter = result.content?.metadata?.extensions?.twitter || result.content?.links?.external_url;
    const telegram = result.content?.metadata?.extensions?.telegram;
    
    // Check 2: Freeze Authority (Ganz wichtig!)
    const isFreezeSafe = result.authorities?.every((a: any) => a.scopes?.includes('owner')) || result.authorities?.length === 0;

    // Check 3: Whale Check (Top 10 Holders)
    const holderRes = await fetch(HELIUS_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 'whale', method: 'getTokenLargestAccounts', params: [mint]
      })
    });
    const { result: holders } = await holderRes.json();
    const supply = result.token_info?.supply || 1;
    const top10Amount = (holders?.value || []).slice(0, 10).reduce((acc: number, curr: any) => acc + parseInt(curr.amount), 0);
    const top10Percent = (top10Amount / supply) * 100;

    // Score Berechnung (0-100)
    let score = 50; 
    if (isFreezeSafe) score += 20;
    if (twitter || telegram) score += 15;
    if (top10Percent < 30) score += 15;

    return {
      score,
      isSafe: isFreezeSafe && top10Percent < 40,
      image: result.content?.links?.image || result.content?.metadata?.image || "",
      twitter,
      telegram,
      holders: top10Percent.toFixed(1)
    };
  } catch (e) {
    return { score: 0, isSafe: false, image: "", twitter: "", telegram: "", holders: "0" };
  }
}

export async function GET() {
  if (!HELIUS_URL) return NextResponse.json({ error: "HELIUS_KEY_MISSING" }, { status: 500 });

  try {
    const response = await fetch('https://api.dexscreener.com/latest/dex/search?q=pump', { cache: 'no-store' });
    const data = await response.json();
    if (!data.pairs) return NextResponse.json({ signals: [] });

    const now = Date.now();
    // Filter: Solana, unter $750k MCap, jünger als 60 Min
    const filtered = data.pairs
      .filter((p: any) => p.chainId === 'solana' && (now - p.pairCreatedAt) / 60000 < 60 && (p.fdv || 0) < 750000)
      .slice(0, 12);

    const signals = await Promise.all(filtered.map(async (p: any) => {
      const sec = await checkSecurity(p.baseToken.address);
      return {
        name: p.baseToken.name,
        ticker: p.baseToken.symbol,
        address: p.baseToken.address,
        age: `${Math.floor((now - p.pairCreatedAt) / 60000)}m`,
        mcap: `$${Math.floor(p.fdv || 0).toLocaleString()}`,
        vol: `$${Math.floor(p.volume?.h24 || 0).toLocaleString()}`,
        liq: `$${Math.floor(p.liquidity?.usd || 0).toLocaleString()}`,
        score: sec.score,
        dexUrl: p.url,
        image: sec.image,
        twitter: sec.twitter,
        telegram: sec.telegram,
        isSafe: sec.isSafe,
        holders: sec.holders
      };
    }));

    return NextResponse.json({ signals: signals.filter(s => s.score > 0) });
  } catch (e) {
    return NextResponse.json({ error: "Fetch Error" }, { status: 500 });
  }
}
