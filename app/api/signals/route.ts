import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const HELIUS_URL = process.env.HELIUS_RPC_URL;

const LIVE_MAX_AGE_MINUTES = 10;
const ARCHIVE_MAX_AGE_MINUTES = 60 * 24;
const MIN_LIVE_VOLUME = 5_000;
const MAX_LIVE_MCAP = 12_000;
const SOLANA_CHAIN = "solana";

type DexSocial = {
  type?: string;
  url?: string;
};

type DexWebsite = {
  label?: string;
  url?: string;
};

type DexPair = {
  chainId?: string;
  pairCreatedAt?: number;
  fdv?: number;
  liquidity?: {
    usd?: number;
  };
  volume?: {
    h24?: number;
  };
  txns?: {
    m5?: {
      buys?: number;
      sells?: number;
    };
    h1?: {
      buys?: number;
      sells?: number;
    };
  };
  priceChange?: {
    m5?: number;
    h1?: number;
    h24?: number;
  };
  baseToken?: {
    name?: string;
    symbol?: string;
    address?: string;
  };
  info?: {
    imageUrl?: string;
    socials?: DexSocial[];
    websites?: DexWebsite[];
  };
};

type HeliusAssetResponse = {
  result?: {
    content?: {
      metadata?: {
        image?: string;
        extensions?: {
          twitter?: string;
          telegram?: string;
        };
      };
      links?: {
        image?: string;
        external_url?: string;
      };
    };
    authorities?: Array<{
      scopes?: string[];
    }>;
  };
};

type Enrichment = {
  image: string;
  twitter: string;
  telegram: string;
  website: string;
  isFreezeSafe: boolean;
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function getSocialUrl(
  socials: DexSocial[] | undefined,
  type: "twitter" | "telegram"
) {
  return socials?.find((item) => item.type === type)?.url ?? "";
}

async function getEnrichment(
  mint: string,
  dexImage: string,
  dexTwitter: string,
  dexTelegram: string,
  dexWebsite: string
): Promise<Enrichment> {
  if (!HELIUS_URL) {
    return {
      image: dexImage,
      twitter: dexTwitter,
      telegram: dexTelegram,
      website: dexWebsite,
      isFreezeSafe: false,
    };
  }

  try {
    const response = await fetch(HELIUS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "teft-pulse",
        method: "getAsset",
        params: {
          id: mint,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Helius status ${response.status}`);
    }

    const data = (await response.json()) as HeliusAssetResponse;
    const result = data.result;

    return {
      image:
        result?.content?.links?.image ||
        result?.content?.metadata?.image ||
        dexImage ||
        "",
      twitter:
        result?.content?.metadata?.extensions?.twitter || dexTwitter || "",
      telegram:
        result?.content?.metadata?.extensions?.telegram || dexTelegram || "",
      website: result?.content?.links?.external_url || dexWebsite || "",
      isFreezeSafe:
        !result?.authorities?.some((authority) =>
          authority.scopes?.includes("freeze")
        ),
    };
  } catch (error) {
    console.error(`Helius enrichment failed for ${mint}:`, error);

    return {
      image: dexImage,
      twitter: dexTwitter,
      telegram: dexTelegram,
      website: dexWebsite,
      isFreezeSafe: false,
    };
  }
}

function calculateScore(pair: DexPair, ageMinutes: number, enrichment: Enrichment) {
  const marketCap = Number(pair.fdv || 0);
  const volume24h = Number(pair.volume?.h24 || 0);
  const liquidityUsd = Number(pair.liquidity?.usd || 0);
  const buys5m = Number(pair.txns?.m5?.buys || 0);
  const sells5m = Number(pair.txns?.m5?.sells || 0);
  const buys1h = Number(pair.txns?.h1?.buys || 0);
  const sells1h = Number(pair.txns?.h1?.sells || 0);
  const change5m = Number(pair.priceChange?.m5 || 0);
  const change1h = Number(pair.priceChange?.h1 || 0);

  const buySellRatio5m = buys5m / Math.max(sells5m, 1);
  const buySellRatio1h = buys1h / Math.max(sells1h, 1);
  const volumeToMcap = marketCap > 0 ? volume24h / marketCap : 0;

  let score = 0;

  if (ageMinutes <= 2) score += 18;
  else if (ageMinutes <= 5) score += 14;
  else if (ageMinutes <= LIVE_MAX_AGE_MINUTES) score += 9;
  else if (ageMinutes <= 20) score += 5;

  if (volume24h >= 20_000) score += 18;
  else if (volume24h >= 12_000) score += 14;
  else if (volume24h >= MIN_LIVE_VOLUME) score += 10;

  if (marketCap > 0 && marketCap <= 6_000) score += 16;
  else if (marketCap <= 9_000) score += 12;
  else if (marketCap <= MAX_LIVE_MCAP) score += 8;
  else if (marketCap <= 25_000) score += 4;

  if (volumeToMcap >= 1) score += 14;
  else if (volumeToMcap >= 0.65) score += 10;
  else if (volumeToMcap >= 0.4) score += 6;

  if (liquidityUsd >= 8_000) score += 10;
  else if (liquidityUsd >= 4_000) score += 8;
  else if (liquidityUsd >= 2_000) score += 5;

  if (buys5m >= 30) score += 8;
  else if (buys5m >= 15) score += 5;

  if (buySellRatio5m >= 1.8) score += 8;
  else if (buySellRatio5m >= 1.2) score += 5;

  if (buySellRatio1h >= 1.2) score += 4;

  if (change5m > 0) score += 3;
  if (change1h > 0) score += 2;

  if (enrichment.twitter || enrichment.telegram) score += 4;
  if (enrichment.website) score += 2;
  if (enrichment.image) score += 2;
  if (enrichment.isFreezeSafe) score += 5;

  if (marketCap > 40_000) score -= 8;
  if (volume24h < MIN_LIVE_VOLUME) score -= 12;
  if (liquidityUsd < 1_500) score -= 10;
  if (!enrichment.isFreezeSafe) score -= 6;

  return clamp(Math.round(score));
}

function getSignalLabel(score: number) {
  if (score >= 85) return "Strong";
  if (score >= 70) return "Watch";
  if (score >= 55) return "Spec";
  return "Ignore";
}

async function processPair(pair: DexPair, now: number) {
  const mint = pair.baseToken?.address || "";
  const ageMinutes = Math.max(
    0,
    Math.floor((now - Number(pair.pairCreatedAt || 0)) / 60_000)
  );

  const dexTwitter = getSocialUrl(pair.info?.socials, "twitter");
  const dexTelegram = getSocialUrl(pair.info?.socials, "telegram");
  const dexWebsite = pair.info?.websites?.[0]?.url || "";
  const dexImage = pair.info?.imageUrl || "";

  const enrichment = mint
    ? await getEnrichment(mint, dexImage, dexTwitter, dexTelegram, dexWebsite)
    : {
        image: dexImage,
        twitter: dexTwitter,
        telegram: dexTelegram,
        website: dexWebsite,
        isFreezeSafe: false,
      };

  const marketCap = Number(pair.fdv || 0);
  const volume24h = Number(pair.volume?.h24 || 0);
  const liquidityUsd = Number(pair.liquidity?.usd || 0);
  const score = calculateScore(pair, ageMinutes, enrichment);

  return {
    name: pair.baseToken?.name || "Unknown",
    ticker: pair.baseToken?.symbol || "UNK",
    address: mint,
    ageMinutes,
    marketCap,
    volume24h,
    liquidityUsd,
    score,
    signal: getSignalLabel(score),
    image: enrichment.image,
    twitter: enrichment.twitter,
    telegram: enrichment.telegram,
    website: enrichment.website,
    isFreezeSafe: enrichment.isFreezeSafe,
    change5m: Number(pair.priceChange?.m5 || 0),
    change1h: Number(pair.priceChange?.h1 || 0),
    change24h: Number(pair.priceChange?.h24 || 0),
    buys5m: Number(pair.txns?.m5?.buys || 0),
    sells5m: Number(pair.txns?.m5?.sells || 0),
  };
}

export async function GET() {
  try {
    const response = await fetch(
      "https://api.dexscreener.com/latest/dex/search?q=solana%20pump",
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Dexscreener status ${response.status}`);
    }

    const data = await response.json();
    const pairs = (data?.pairs || []) as DexPair[];
    const now = Date.now();

    const candidates = pairs
      .filter(
        (pair) =>
          pair.chainId === SOLANA_CHAIN &&
          pair.baseToken?.address &&
          pair.pairCreatedAt &&
          now - Number(pair.pairCreatedAt) <= ARCHIVE_MAX_AGE_MINUTES * 60_000 &&
          Number(pair.volume?.h24 || 0) >= 3_000
      )
      .slice(0, 60);

    const processed = await Promise.all(
      candidates.map((pair) => processPair(pair, now))
    );

    const liveSignals = processed
      .filter(
        (token) =>
          token.ageMinutes <= LIVE_MAX_AGE_MINUTES &&
          token.volume24h >= MIN_LIVE_VOLUME &&
          token.marketCap <= MAX_LIVE_MCAP &&
          token.score >= 55
      )
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.ageMinutes - b.ageMinutes;
      })
      .slice(0, 12);

    const archiveSignals = processed
      .filter(
        (token) =>
          token.ageMinutes > LIVE_MAX_AGE_MINUTES &&
          token.ageMinutes <= ARCHIVE_MAX_AGE_MINUTES &&
          token.volume24h >= MIN_LIVE_VOLUME &&
          token.score >= 55
      )
      .sort((a, b) => {
        if (b.change24h !== a.change24h) return b.change24h - a.change24h;
        return b.score - a.score;
      })
      .slice(0, 24);

    return NextResponse.json({
      updatedAt: new Date(now).toISOString(),
      criteria: {
        liveWindowMinutes: LIVE_MAX_AGE_MINUTES,
        minVolume24h: MIN_LIVE_VOLUME,
        maxMarketCap: MAX_LIVE_MCAP,
      },
      liveSignals,
      archiveSignals,
    });
  } catch (error) {
    console.error("Pulse API failed:", error);

    return NextResponse.json(
      {
        updatedAt: new Date().toISOString(),
        criteria: {
          liveWindowMinutes: LIVE_MAX_AGE_MINUTES,
          minVolume24h: MIN_LIVE_VOLUME,
          maxMarketCap: MAX_LIVE_MCAP,
        },
        liveSignals: [],
        archiveSignals: [],
        error: "Pulse API fetch failed",
      },
      { status: 500 }
    );
  }
}
