import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const HELIUS_URL = process.env.NEXT_PUBLIC_HELIUS_RPC_URL;

// Kugelsichere Helius-Abfrage
async function getSecurityAndSocials(mint: string, dexImage: string) {
  // Wenn keine Helius URL da ist, crashe nicht, sondern gib Basis-Werte zurück
  if (!HELIUS_URL) {
    return { image: dexImage, twitter: "", telegram: "", isSafe: false, score: 50 };
  }

  try {
    const res = await fetch(HELIUS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 'teft-audit', method: 'getAsset', params: { id: mint }
      })
    });
    
    if (!res.ok) throw new Error("Helius HTTP Error");
    
    const { result } = await res.json();
    if (!result) throw new Error("Kein Result von Helius");

    const twitter = result.content?.metadata?.extensions?.twitter || result.content?.links?.external_url || "";
    const telegram = result.content?.metadata?.extensions?.telegram || "";
    // Nimm Helius Bild, wenn nicht da, nimm Dexscreener Bild als Fallback
    const image = result.content?.links?.image || result.content?.metadata?.image || dexImage || "";

    const isFreezeSafe = !result.authorities?.some((a: any) => a.scopes?.includes('freeze'));

    let score = 50;
    if (isFreezeSafe) score += 25;
    if (twitter || telegram) score += 15;
    if (image) score += 10;

    return { image, twitter, telegram, isSafe: isFreezeSafe, score };
  } catch (e) {
    console.error(`Helius Fehler für Token ${mint}:`, e);
    // Fallback bei Helius-Fehler
    return { image: dexImage, twitter: "", telegram: "", isSafe: false, score: 50 };
  }
}

export async function GET() {
  try {
    const response = await fetch('https://api.dexscreener.com/latest/dex/search?q=solana%20pump', { 
      cache: 'no-store' 
    });

    if (!response.ok) throw new Error("Dexscreener API Fehler");

    const data = await response.json();
    if (!data || !data.pairs) return NextResponse.json({ signals: [], history: [] });

    const now = Date.now();
    const solanaPairs = data.pairs.filter((p: any) => p.chainId === 'solana');

    // 1. Filtern (0-15 Min = Signals | 15 Min - 24h = History)
    const rawSignals = solanaPairs.filter((p: any) => ((now - p.pairCreatedAt) / 60000) <= 15).slice(0, 10);
    const rawHistory = solanaPairs.filter((p: any) => {
      const ageMin = (now - p.pairCreatedAt) / 60000;
      return ageMin > 15 && ageMin <= 1440;
    }).slice(0, 15);

    // 2. Formatieren & Helius Check anwenden (Parallel für Speed)
    const processTokens = async (tokens: any[]) => {
      return Promise.all(tokens.map(async (p: any) => {
        const ageMin = Math.floor((now - p.pairCreatedAt) / 60000);
        let ageStr = `${ageMin} min`;
        if (ageMin > 60) ageStr = `${Math.floor(ageMin/60)}h ${ageMin%60}m`;

        const dexImage = p.info?.imageUrl || "";
        
        // Helius Check aufrufen
        const audit = await getSecurityAndSocials(p.baseToken.address, dexImage);

        return {
          name: p.baseToken.name || "Unknown",
          ticker: p.baseToken.symbol || "UNK",
          address: p.baseToken.address,
          age: ageStr,
          mcap: `$${Math.floor(p.fdv || 0).toLocaleString()}`,
          vol: `$${Math.floor(p.volume?.h24 || 0).toLocaleString()}`,
          priceChange: p.priceChange?.h24 || 0,
          image: audit.image,
          twitter: audit.twitter || p.info?.socials?.find((s:any) => s.type === 'twitter')?.url || "",
          telegram: audit.telegram || p.info?.socials?.find((s:any) => s.type === 'telegram')?.url || "",
          score: audit.score,
          isSafe: audit.isSafe
        };
      }));
    };

    const signals = await processTokens(rawSignals);
    const history = await processTokens(rawHistory);

    return NextResponse.json({ signals, history });

  } catch (error) {
    console.error("Critical API Error:", error);
    return NextResponse.json({ signals: [], history: [], error: "API fetch failed" }, { status: 500 });
  }
}
