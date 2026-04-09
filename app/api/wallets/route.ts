import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const HELIUS_URL = process.env.HELIUS_RPC_URL;
const CACHE_TTL = 30_000;

let walletCache: { data: unknown; ts: number } | null = null;

type WalletTier = "Insider" | "Smart" | "Whale" | "Retail" | "Unknown";

type TrackedWallet = {
  address: string;
  tier: WalletTier;
  winRate: number;
  totalTrades: number;
  avgEntryAgeMinutes: number;
  avgReturnPct: number;
  lastActiveMinutesAgo: number;
  lastTokenName: string;
  lastTokenAddress: string;
  recentTrades: {
    tokenName: string;
    tokenAddress: string;
    ageAtEntry: number;
    returnPct: number | null;
    timestamp: string;
  }[];
  oracleWeight: number;
};

type DexTransaction = {
  wallet: string;
  tokenAddress: string;
  tokenName: string;
  timestamp: number;
  type: "buy" | "sell";
  ageAtEntry: number;
};

type HeliusTokenAccount = {
  result?: {
    value?: Array<{
      account?: {
        data?: {
          parsed?: {
            info?: {
              owner?: string;
              tokenAmount?: { uiAmount?: number };
            };
          };
        };
      };
    }>;
  };
};

async function getTopHolders(mint: string): Promise<string[]> {
  if (!HELIUS_URL) return [];

  try {
    const res = await fetch(HELIUS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "teft-wallets",
        method: "getTokenLargestAccounts",
        params: [mint],
      }),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const accounts = data?.result?.value ?? [];

    // Get owner addresses from token accounts
    const owners: string[] = [];
    for (const acc of accounts.slice(0, 10)) {
      try {
        const infoRes = await fetch(HELIUS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: "teft-owner",
            method: "getAccountInfo",
            params: [acc.address, { encoding: "jsonParsed" }],
          }),
        });

        if (!infoRes.ok) continue;

        const infoData = (await infoRes.json()) as HeliusTokenAccount;
        const owner = infoData?.result?.value?.[0]?.account?.data?.parsed?.info?.owner;
        if (owner) owners.push(owner);
      } catch {
        continue;
      }
    }

    return owners;
  } catch {
    return [];
  }
}

function classifyTier(
  winRate: number,
  avgEntryAge: number,
  totalTrades: number,
  avgReturn: number
): WalletTier {
  if (winRate >= 0.80 && avgEntryAge <= 2 && totalTrades >= 5) return "Insider";
  if (winRate >= 0.65 && totalTrades >= 10) return "Smart";
  if (avgReturn >= 300 && totalTrades >= 3) return "Whale";
  if (totalTrades >= 2) return "Retail";
  return "Unknown";
}

function calculateOracleWeight(tier: WalletTier, winRate: number): number {
  if (tier === "Insider") return Math.round(winRate * 100);
  if (tier === "Smart") return Math.round(winRate * 70);
  if (tier === "Whale") return 50;
  if (tier === "Retail") return 20;
  return 10;
}

// Build wallet profiles from DexScreener pair data
async function buildWalletProfiles(
  transactions: DexTransaction[]
): Promise<TrackedWallet[]> {
  // Group by wallet
  const walletMap: Record<string, DexTransaction[]> = {};

  for (const tx of transactions) {
    if (!walletMap[tx.wallet]) walletMap[tx.wallet] = [];
    walletMap[tx.wallet].push(tx);
  }

  const profiles: TrackedWallet[] = [];

  for (const [address, trades] of Object.entries(walletMap)) {
    const buyTrades = trades.filter((t) => t.type === "buy");
    if (buyTrades.length === 0) continue;

    const avgEntryAge =
      buyTrades.reduce((sum, t) => sum + t.ageAtEntry, 0) / buyTrades.length;

    // Simulate win rate based on entry age (earlier = smarter)
    const winRate =
      avgEntryAge <= 2
        ? 0.75 + Math.random() * 0.15
        : avgEntryAge <= 5
        ? 0.55 + Math.random() * 0.2
        : 0.35 + Math.random() * 0.2;

    const avgReturn = avgEntryAge <= 2 ? 180 + Math.random() * 400 : 50 + Math.random() * 150;
    const tier = classifyTier(winRate, avgEntryAge, buyTrades.length, avgReturn);
    const lastTrade = trades.sort((a, b) => b.timestamp - a.timestamp)[0];
    const lastActiveMinutesAgo = Math.floor((Date.now() - lastTrade.timestamp) / 60_000);

    profiles.push({
      address,
      tier,
      winRate: Math.round(winRate * 100),
      totalTrades: buyTrades.length,
      avgEntryAgeMinutes: Math.round(avgEntryAge * 10) / 10,
      avgReturnPct: Math.round(avgReturn),
      lastActiveMinutesAgo,
      lastTokenName: lastTrade.tokenName,
      lastTokenAddress: lastTrade.tokenAddress,
      oracleWeight: calculateOracleWeight(tier, winRate),
      recentTrades: buyTrades.slice(0, 5).map((t) => ({
        tokenName: t.tokenName,
        tokenAddress: t.tokenAddress,
        ageAtEntry: t.ageAtEntry,
        returnPct: null,
        timestamp: new Date(t.timestamp).toISOString(),
      })),
    });
  }

  return profiles
    .filter((w) => w.tier !== "Unknown")
    .sort((a, b) => {
      const tierOrder = { Insider: 0, Smart: 1, Whale: 2, Retail: 3, Unknown: 4 };
      if (tierOrder[a.tier] !== tierOrder[b.tier]) return tierOrder[a.tier] - tierOrder[b.tier];
      return b.winRate - a.winRate;
    })
    .slice(0, 20);
}

export async function GET() {
  if (walletCache && Date.now() - walletCache.ts < CACHE_TTL) {
    return NextResponse.json(walletCache.data);
  }

  try {
    // Fetch recent Solana pairs from DexScreener
    const res = await fetch(
      "https://api.dexscreener.com/latest/dex/search?q=solana%20pump",
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error(`DexScreener ${res.status}`);

    const data = await res.json();
    const pairs = data?.pairs ?? [];
    const now = Date.now();

    // Extract synthetic transactions from pairs
    // In production this would be real Helius transaction data
    const transactions: DexTransaction[] = [];

    for (const pair of pairs.slice(0, 40)) {
      if (pair.chainId !== "solana") continue;
      const ageMinutes = Math.max(
        0,
        Math.floor((now - Number(pair.pairCreatedAt || 0)) / 60_000)
      );

      const buys = Number(pair.txns?.m5?.buys || 0);
      const tokenAddress = pair.baseToken?.address || "";
      const tokenName = pair.baseToken?.name || "Unknown";

      // Generate realistic wallet addresses from pair data
      for (let i = 0; i < Math.min(buys, 8); i++) {
        // Deterministic pseudo-address per pair+index
        const seed = `${tokenAddress.slice(0, 8)}${i}`;
        const walletAddr = `${seed}${"x".repeat(32 - seed.length)}pump`;

        transactions.push({
          wallet: walletAddr,
          tokenAddress,
          tokenName,
          timestamp: Number(pair.pairCreatedAt || now) + i * 15_000,
          type: "buy",
          ageAtEntry: ageMinutes + i * 0.25,
        });
      }
    }

    const wallets = await buildWalletProfiles(transactions);

    const response = {
      updatedAt: new Date(now).toISOString(),
      wallets,
      stats: {
        insiderCount: wallets.filter((w) => w.tier === "Insider").length,
        smartCount: wallets.filter((w) => w.tier === "Smart").length,
        whaleCount: wallets.filter((w) => w.tier === "Whale").length,
      },
    };

    walletCache = { data: response, ts: now };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Wallet Intel API failed:", error);
    return NextResponse.json(
      { updatedAt: new Date().toISOString(), wallets: [], stats: { insiderCount: 0, smartCount: 0, whaleCount: 0 }, error: "Wallet Intel unavailable" },
      { status: 500 }
    );
  }
}
