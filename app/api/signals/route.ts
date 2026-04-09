"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Mail,
  RefreshCw,
  Send,
  Twitter,
  Shield,
  ShieldCheck,
  Zap,
} from "lucide-react";

const HERO_IMAGE = "/teft.png";
const SOL_MINT = "So11111111111111111111111111111111111111112";
const REFRESH_INTERVAL = 15_000;

type OracleTrigger = {
  walletTiers: string[];
  patternName: string;
  patternDescription: string;
  patternOccurrences: number;
  patternSuccessRate: number;
  confluenceScore: number;
};

type OracleToken = {
  name: string;
  ticker: string;
  address: string;
  ageMinutes: number;
  marketCap: number;
  volume24h: number;
  liquidityUsd: number;
  score: number;
  oracleTier: "S" | "A" | "B" | "C";
  signal: "Strong" | "Watch" | "Spec" | "Near Miss" | "Ignore" | string;
  image: string;
  twitter: string;
  telegram: string;
  website: string;
  isFreezeSafe: boolean;
  isMintRevoked: boolean;
  change5m: number;
  change1h: number;
  change24h: number;
  buys5m: number;
  sells5m: number;
  trigger: OracleTrigger;
};

type OracleResponse = {
  updatedAt: string;
  criteria: {
    liveWindowMinutes: number;
    minVolume24h: number;
    maxMarketCap: number;
  };
  meta?: {
    strictLiveCount: number;
    fallbackUsed: boolean;
  };
  liveSignals: OracleToken[];
  archiveSignals: OracleToken[];
  error?: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(value));
}

function formatAge(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function formatChange(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function buildJupiterUrl(mint: string) {
  return `https://jup.ag/swap?buy=${mint}&sell=${SOL_MINT}`;
}

function initials(token: OracleToken) {
  return (token.ticker || token.name || "T").slice(0, 2).toUpperCase();
}

function signalClasses(signal: string) {
  if (signal === "Strong") return "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30";
  if (signal === "Watch") return "bg-amber-500/15 text-amber-200 border border-amber-400/30";
  if (signal === "Spec") return "bg-sky-500/15 text-sky-200 border border-sky-400/30";
  if (signal === "Near Miss") return "bg-orange-500/15 text-orange-200 border border-orange-400/30";
  return "bg-zinc-500/15 text-zinc-200 border border-zinc-400/20";
}

function tierClasses(tier: string) {
  if (tier === "S") return "text-emerald-300 border-emerald-400/40 bg-emerald-500/10";
  if (tier === "A") return "text-amber-300 border-amber-400/40 bg-amber-500/10";
  if (tier === "B") return "text-sky-300 border-sky-400/40 bg-sky-500/10";
  return "text-zinc-400 border-zinc-500/40 bg-zinc-500/10";
}

function ConfidenceBar({ score }: { score: number }) {
  const filled = Math.round(score / 10);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-3 rounded-full ${
              i < filled ? "bg-white/70" : "bg-white/10"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-white/50">{score}</span>
    </div>
  );
}

function SafetyBadges({ isFreezeSafe, isMintRevoked }: { isFreezeSafe: boolean; isMintRevoked: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
          isFreezeSafe
            ? "bg-emerald-500/10 text-emerald-300 border-emerald-400/30"
            : "bg-red-500/10 text-red-300 border-red-400/30"
        }`}
      >
        {isFreezeSafe ? <ShieldCheck size={10} /> : <Shield size={10} />}
        Freeze
      </span>
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
          isMintRevoked
            ? "bg-emerald-500/10 text-emerald-300 border-emerald-400/30"
            : "bg-red-500/10 text-red-300 border-red-400/30"
        }`}
      >
        {isMintRevoked ? <ShieldCheck size={10} /> : <Shield size={10} />}
        Mint
      </span>
    </div>
  );
}

function PatternBadge({ trigger }: { trigger: OracleTrigger }) {
  return (
    <div className="rounded-[14px] border border-white/8 bg-white/[0.03] px-3 py-2">
      <div className="flex items-center gap-1.5 mb-1">
        <Zap size={11} className="text-amber-300" />
        <span className="text-[11px] font-bold text-amber-200">{trigger.patternName}</span>
      </div>
      <p className="text-[10px] text-white/45">{trigger.patternDescription}</p>
      <div className="mt-1.5 flex items-center gap-2 text-[10px] text-white/35">
        <span>{trigger.patternOccurrences} occurrences</span>
        <span>·</span>
        <span className="text-emerald-400/70">{trigger.patternSuccessRate}% success</span>
      </div>
    </div>
  );
}

function TokenCard({
  token,
  tradeSize,
  archive = false,
}: {
  token: OracleToken;
  tradeSize: string;
  archive?: boolean;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-sm p-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-full overflow-hidden bg-white/10 border border-white/10 shrink-0">
          {token.image ? (
            <img
              src={token.image}
              alt={token.name}
              className="h-full w-full object-cover"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs font-black text-white/70">
              {initials(token)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-white font-bold text-[20px] leading-none">{token.name}</p>
                <span className="text-white/40 text-xs uppercase tracking-wide">{token.ticker}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2 flex-wrap text-white/40 text-xs">
                <span>{formatAge(token.ageMinutes)}</span>
                <span>·</span>
                <span>${formatCurrency(token.marketCap)} MCAP</span>
                <span>·</span>
                <span>${formatCurrency(token.volume24h)} VOL</span>
              </div>
            </div>

            {/* Oracle Tier + Signal */}
            <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
              <span className={`text-xs font-black border rounded-full px-2 py-0.5 ${tierClasses(token.oracleTier)}`}>
                {token.oracleTier}-Tier
              </span>
              <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${signalClasses(token.signal)}`}>
                {token.signal}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="mt-3">
        <ConfidenceBar score={token.score} />
      </div>

      {/* Safety Badges */}
      <div className="mt-2.5">
        <SafetyBadges isFreezeSafe={token.isFreezeSafe} isMintRevoked={token.isMintRevoked} />
      </div>

      {/* Pattern */}
      {token.trigger && (
        <div className="mt-2.5">
          <PatternBadge trigger={token.trigger} />
        </div>
      )}

      {/* Stats */}
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        {archive ? (
          <div className="flex items-center gap-3 text-xs text-white/50">
            <span>5m <span className={token.change5m >= 0 ? "text-emerald-400" : "text-red-400"}>{formatChange(token.change5m)}</span></span>
            <span>1h <span className={token.change1h >= 0 ? "text-emerald-400" : "text-red-400"}>{formatChange(token.change1h)}</span></span>
            <span>24h <span className={token.change24h >= 0 ? "text-emerald-400" : "text-red-400"}>{formatChange(token.change24h)}</span></span>
          </div>
        ) : (
          <div className="text-xs text-white/45">
            Buy/Sell 5m <span className="text-white/70">{token.buys5m}/{token.sells5m}</span>
          </div>
        )}
      </div>

      {/* Socials + Buy */}
      <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          {token.twitter && (
            <a href={token.twitter} target="_blank" rel="noreferrer"
              className="h-7 w-7 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white transition">
              <Twitter size={13} />
            </a>
          )}
          {token.telegram && (
            <a href={token.telegram} target="_blank" rel="noreferrer"
              className="h-7 w-7 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white transition">
              <Send size={13} />
            </a>
          )}
          <span className="text-[10px] text-white/30 ml-1">
            {token.address.slice(0, 4)}...{token.address.slice(-4)}
          </span>
        </div>

        
          href={buildJupiterUrl(token.address)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-white text-black px-4 py-2 text-sm font-extrabold hover:opacity-90 transition"
        >
          Buy {tradeSize} SOL
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}

function RefreshCountdown({ interval, lastFetch }: { interval: number; lastFetch: number }) {
  const [remaining, setRemaining] = useState(interval / 1000);

  useEffect(() => {
    const tick = setInterval(() => {
      const elapsed = (Date.now() - lastFetch) / 1000;
      setRemaining(Math.max(0, Math.round(interval / 1000 - elapsed)));
    }, 500);
    return () => clearInterval(tick);
  }, [lastFetch, interval]);

  const pct = (remaining / (interval / 1000)) * 100;

  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-20 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-white/40 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] text-white/40">{remaining}s</span>
    </div>
  );
}

export default function OraclePage() {
  const [data, setData] = useState<OracleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tradeSize, setTradeSize] = useState("0.5");
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [lastFetch, setLastFetch] = useState(Date.now());

  const fetchSignals = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/signals", { cache: "no-store" });
      if (!res.ok) throw new Error("Oracle data unavailable");
      const json = (await res.json()) as OracleResponse;
      setData(json);
      setLastFetch(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown Oracle error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSignals();
    const refresh = setInterval(fetchSignals, REFRESH_INTERVAL);
    const clock = setInterval(() => setNow(Date.now()), 1_000);
    return () => { clearInterval(refresh); clearInterval(clock); };
  }, [fetchSignals]);

  const liveSignals = data?.liveSignals ?? [];
  const archiveSignals = data?.archiveSignals ?? [];

  const updatedAgo = useMemo(() => {
    if (!data?.updatedAt) return "Updating...";
    const seconds = Math.max(0, Math.floor((now - new Date(data.updatedAt).getTime()) / 1000));
    return `${seconds}s ago`;
  }, [data?.updatedAt, now]);

  return (
    <main className="min-h-screen bg-[#dcdcdc] py-8 px-3 sm:px-4">
      <div className="mx-auto w-full max-w-[440px] overflow-hidden rounded-[36px] border border-black/5 bg-[#111111] shadow-[0_30px_80px_rgba(0,0,0,0.22)]">

        {/* Hero */}
        <section
          className="relative min-h-[330px] bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/45 to-black/80" />
          <div className="relative z-10 p-5 flex min-h-[330px] flex-col">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-black/25 px-3 py-2 text-sm font-semibold text-white/85 backdrop-blur-md border border-white/10"
              >
                <ArrowLeft size={16} />
                Back
              </Link>
              <div className="rounded-full bg-black/25 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/65 backdrop-blur-md border border-white/10">
                Wallet Intel soon
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center">
              
                href="#live-signals"
                className="inline-flex items-center justify-center rounded-[18px] bg-black/45 px-7 py-4 text-[18px] font-semibold text-white backdrop-blur-md border border-white/15"
              >
                Enter Oracle
              </a>
            </div>

            <div className="border-t border-white/10 pt-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h1 className="text-[34px] font-black leading-none tracking-tight text-white">
                    TEFT Oracle
                  </h1>
                  <p className="mt-2 text-white/70 text-lg">See what others don't.</p>
                </div>
                <button
                  onClick={fetchSignals}
                  className="inline-flex items-center gap-2 rounded-full bg-black/25 px-4 py-3 text-sm font-semibold text-white/85 backdrop-blur-md border border-white/10 hover:bg-black/35 transition"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Panel */}
        <section className="px-4 pb-6 -mt-1">
          <div className="rounded-[28px] border border-white/10 bg-black/55 backdrop-blur-xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.22)]">

            {/* Tabs + Updated */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-[14px] bg-white/10 px-4 py-2 text-white font-semibold text-sm">Feed</span>
                <span className="rounded-[14px] bg-white/5 px-4 py-2 text-white/60 font-medium text-sm">Archive 24h</span>
                <span className="rounded-[14px] bg-white/5 px-4 py-2 text-white/40 font-medium text-sm">Intel soon</span>
              </div>
              <div className="text-xs text-white/40">{updatedAgo}</div>
            </div>

            {/* Controls */}
            <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 rounded-[16px] bg-white/5 border border-white/10 px-3 py-2">
                <span className="text-sm text-white/55">Buy Size</span>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={tradeSize}
                  onChange={(e) => setTradeSize(e.target.value)}
                  className="w-16 bg-transparent text-white font-bold outline-none"
                />
                <span className="text-sm text-white/75">SOL</span>
              </div>

              <div className="flex items-center gap-2">
                <RefreshCountdown interval={REFRESH_INTERVAL} lastFetch={lastFetch} />
                
                  href="mailto:support@teftlegion.com?subject=TEFT%20Oracle%20Feedback"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-2 text-xs font-medium text-white/70 border border-white/10 hover:bg-white/10 transition"
                >
                  <Mail size={13} />
                  Feedback
                </a>
              </div>
            </div>

            {/* Criteria */}
            <div className="mt-4 rounded-[20px] border border-white/10 bg-white/[0.03] px-3 py-3 text-xs text-white/45">
              Live filter: age ≤ {data?.criteria.liveWindowMinutes ?? 10}m · vol ≥ ${formatCurrency(data?.criteria.minVolume24h ?? 5000)} · mcap ≤ ${formatCurrency(data?.criteria.maxMarketCap ?? 12000)}
            </div>

            {/* Fallback notice */}
            {data?.meta?.fallbackUsed && (
              <div className="mt-3 rounded-[18px] border border-orange-400/20 bg-orange-500/10 px-3 py-3 text-xs text-orange-200">
                No strict live signals right now — showing best near-miss candidates.
              </div>
            )}

            {/* Live Signals */}
            <div id="live-signals" className="mt-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white text-lg font-extrabold">Live Signals</h2>
                <div className="text-xs text-white/40">{liveSignals.length} active</div>
              </div>

              {loading ? (
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-5 text-white/50 text-sm">
                  Oracle is scanning...
                </div>
              ) : error ? (
                <div className="rounded-[22px] border border-red-400/20 bg-red-500/10 p-5 text-red-200 text-sm">
                  {error}
                </div>
              ) : liveSignals.length === 0 ? (
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-5 text-white/50 text-sm">
                  No live signals right now. Oracle is watching.
                </div>
              ) : (
                <div className="space-y-3">
                  {liveSignals.map((token) => (
                    <TokenCard key={token.address} token={token} tradeSize={tradeSize} />
                  ))}
                </div>
              )}
            </div>

            {/* Archive */}
            <div className="mt-7">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white text-lg font-extrabold">Missed · 24h Archive</h2>
                <div className="text-xs text-white/40">{archiveSignals.length} tracked</div>
              </div>

              {archiveSignals.length === 0 ? (
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-5 text-white/50 text-sm">
                  No archive candidates yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {archiveSignals.map((token) => (
                    <TokenCard key={`${token.address}-archive`} token={token} tradeSize={tradeSize} archive />
                  ))}
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="mt-6 text-center text-xs text-white/30">
              Many of these will fail. Don't trust — verify. DYOR always.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
