"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Mail,
  RefreshCw,
  Send,
  Twitter,
} from "lucide-react";

type PulseToken = {
  name: string;
  ticker: string;
  address: string;
  ageMinutes: number;
  marketCap: number;
  volume24h: number;
  liquidityUsd: number;
  score: number;
  signal: "Strong" | "Watch" | "Spec" | "Ignore" | string;
  image: string;
  twitter: string;
  telegram: string;
  website: string;
  isFreezeSafe: boolean;
  change5m: number;
  change1h: number;
  change24h: number;
  buys5m: number;
  sells5m: number;
};

type PulseResponse = {
  updatedAt: string;
  criteria: {
    liveWindowMinutes: number;
    minVolume24h: number;
    maxMarketCap: number;
  };
  liveSignals: PulseToken[];
  archiveSignals: PulseToken[];
  error?: string;
};

const HERO_IMAGE = "/teft.png";
const SOL_MINT = "So11111111111111111111111111111111111111112";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function formatAge(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function formatChange(value: number) {
  const rounded = value.toFixed(1);
  return `${value >= 0 ? "+" : ""}${rounded}%`;
}

function signalClasses(signal: string) {
  if (signal === "Strong") {
    return "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30";
  }

  if (signal === "Watch") {
    return "bg-amber-500/15 text-amber-200 border border-amber-400/30";
  }

  return "bg-zinc-500/15 text-zinc-200 border border-zinc-400/20";
}

function buildJupiterUrl(mint: string) {
  return `https://jup.ag/swap?buy=${mint}&sell=${SOL_MINT}`;
}

function initials(token: PulseToken) {
  return (token.ticker || token.name || "T").slice(0, 2).toUpperCase();
}

function TokenRow({
  token,
  tradeSize,
  archive = false,
}: {
  token: PulseToken;
  tradeSize: string;
  archive?: boolean;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-sm p-4">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-full overflow-hidden bg-white/10 border border-white/10 shrink-0">
          {token.image ? (
            <img
              src={token.image}
              alt={token.name}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs font-black text-white/70">
              {initials(token)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-white font-bold text-[22px] leading-none">
                  {token.name}
                </p>
                <span className="text-white/40 text-sm uppercase tracking-wide">
                  {token.ticker}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2 flex-wrap text-white/45 text-xs">
                <span>{formatAge(token.ageMinutes)}</span>
                <span>•</span>
                <span>${formatCurrency(token.marketCap)} MCAP</span>
                <span>•</span>
                <span>${formatCurrency(token.volume24h)} VOL</span>
              </div>

              <div className="mt-2 flex items-center gap-2 flex-wrap">
                {token.twitter ? (
                  <a
                    href={token.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="h-7 w-7 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/70 hover:text-white transition"
                  >
                    <Twitter size={14} />
                  </a>
                ) : null}

                {token.telegram ? (
                  <a
                    href={token.telegram}
                    target="_blank"
                    rel="noreferrer"
                    className="h-7 w-7 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/70 hover:text-white transition"
                  >
                    <Send size={14} />
                  </a>
                ) : null}

                {token.website ? (
                  <a
                    href={token.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-white/55 hover:text-white transition"
                  >
                    Website
                  </a>
                ) : null}
              </div>
            </div>

            <div className="text-right shrink-0">
              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${signalClasses(
                  token.signal
                )}`}
              >
                <span>{token.signal}</span>
                <span className="text-white">{token.score}</span>
              </div>

              {archive ? (
                <div className="mt-3 space-y-1 text-xs text-white/60">
                  <div>5m {formatChange(token.change5m)}</div>
                  <div>1h {formatChange(token.change1h)}</div>
                  <div>24h {formatChange(token.change24h)}</div>
                </div>
              ) : (
                <div className="mt-3 text-xs text-white/60">
                  Buy/Sell 5m {token.buys5m}/{token.sells5m}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="text-xs text-white/45 break-all">
              {token.address.slice(0, 4)}...{token.address.slice(-4)}
            </div>

            <a
              href={buildJupiterUrl(token.address)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white text-black px-4 py-2 text-sm font-extrabold hover:opacity-90 transition"
            >
              Buy {tradeSize} SOL
              <ExternalLink size={15} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PulsePage() {
  const [data, setData] = useState<PulseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tradeSize, setTradeSize] = useState("0.5");
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  async function fetchSignals() {
    try {
      setError(null);
      const response = await fetch("/api/signals", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Pulse data unavailable");
      }

      const json = (await response.json()) as PulseResponse;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown Pulse error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSignals();

    const refreshInterval = setInterval(fetchSignals, 15_000);
    const clockInterval = setInterval(() => setNow(Date.now()), 1_000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(clockInterval);
    };
  }, []);

  const liveSignals = data?.liveSignals ?? [];
  const archiveSignals = data?.archiveSignals ?? [];

  const updatedAgo = useMemo(() => {
    if (!data?.updatedAt) return "Updating...";
    const seconds = Math.max(
      0,
      Math.floor((now - new Date(data.updatedAt).getTime()) / 1000)
    );
    return `Updated ${seconds} seconds ago`;
  }, [data?.updatedAt, now]);

  return (
    <main className="min-h-screen bg-[#dcdcdc] py-8 px-3 sm:px-4">
      <div className="mx-auto w-full max-w-[440px] overflow-hidden rounded-[36px] border border-black/5 bg-[#111111] shadow-[0_30px_80px_rgba(0,0,0,0.22)]">
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
                Feed Options soon
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <a
                href="#live-signals"
                className="inline-flex items-center justify-center rounded-[18px] bg-black/45 px-7 py-4 text-[18px] font-semibold text-white backdrop-blur-md border border-white/15"
              >
                Enter Gateway
              </a>
            </div>

            <div className="border-t border-white/10 pt-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h1 className="text-[34px] font-black leading-none tracking-tight text-white">
                    TEFT Pulse
                  </h1>
                  <p className="mt-2 text-white/70 text-lg">
                    See what others don’t.
                  </p>
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

        <section className="px-4 pb-6 -mt-1">
          <div className="rounded-[28px] border border-white/10 bg-black/55 backdrop-blur-xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-[14px] bg-white/10 px-4 py-2 text-white font-semibold">
                  Feed
                </span>
                <span className="rounded-[14px] bg-white/5 px-4 py-2 text-white/60 font-medium">
                  Archive 24h
                </span>
                <span className="rounded-[14px] bg-white/5 px-4 py-2 text-white/40 font-medium">
                  Options soon
                </span>
              </div>

              <div className="text-sm text-white/55">{updatedAgo}</div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 rounded-[16px] bg-white/5 border border-white/10 px-3 py-2">
                <span className="text-sm text-white/55">Buy Size</span>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={tradeSize}
                  onChange={(event) => setTradeSize(event.target.value)}
                  className="w-16 bg-transparent text-white font-bold outline-none"
                />
                <span className="text-sm text-white/75">SOL</span>
              </div>

              <a
                href="mailto:support@teftlegion.com?subject=TEFT%20Pulse%20Feedback"
                className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-white/80 border border-white/10 hover:bg-white/10 transition"
              >
                <Mail size={15} />
                Feedback
              </a>
            </div>

            <div className="mt-4 rounded-[20px] border border-white/10 bg-white/[0.03] px-3 py-3 text-xs text-white/55">
              Live filter: age ≤ {data?.criteria.liveWindowMinutes ?? 10} min · volume ≥ $
              {formatCurrency(data?.criteria.minVolume24h ?? 5000)} · mcap ≤ $
              {formatCurrency(data?.criteria.maxMarketCap ?? 12000)}
            </div>

            <div id="live-signals" className="mt-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white text-lg font-extrabold">Live Signals</h2>
                <div className="text-xs text-white/45">
                  {liveSignals.length} active
                </div>
              </div>

              {loading ? (
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-5 text-white/60">
                  Loading Pulse...
                </div>
              ) : error ? (
                <div className="rounded-[22px] border border-red-400/20 bg-red-500/10 p-5 text-red-200">
                  {error}
                </div>
              ) : liveSignals.length === 0 ? (
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-5 text-white/60">
                  No live signals right now.
                </div>
              ) : (
                <div className="space-y-3">
                  {liveSignals.map((token) => (
                    <TokenRow key={token.address} token={token} tradeSize={tradeSize} />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-7">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white text-lg font-extrabold">
                  Missed / Still Running · 24h
                </h2>
                <div className="text-xs text-white/45">
                  {archiveSignals.length} tracked
                </div>
              </div>

              {archiveSignals.length === 0 ? (
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-5 text-white/60">
                  No archive candidates yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {archiveSignals.map((token) => (
                    <TokenRow
                      key={`${token.address}-archive`}
                      token={token}
                      tradeSize={tradeSize}
                      archive
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 text-center text-sm text-white/40">
              Many of these will fail. Don’t trust — verify. Signal fee applies.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
