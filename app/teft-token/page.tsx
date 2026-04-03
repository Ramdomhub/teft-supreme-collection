"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";

type NftItem = {
  address: string;
  name: string;
  image: string;
  price: number;
};

type NftResponse = {
  items: NftItem[];
  floor: number;
  listed: number;
};

const MAGIC_EDEN_COLLECTION_URL =
  "https://magiceden.io/marketplace/teft_supreme";

function formatSol(value: number) {
  return Number.isFinite(value) ? `${value} SOL` : "—";
}

export default function Market() {
  const [data, setData] = useState<NftResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadMarket() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/nfts", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Marketplace-Daten konnten nicht geladen werden.");
      }

      const json = (await response.json()) as NftResponse;
      setData(json);
    } catch (err) {
      setData(null);
      setError(
        err instanceof Error ? err.message : "Unbekannter Fehler beim Laden."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMarket();
  }, []);

  const items = data?.items ?? [];

  const stats = useMemo(
    () => ({
      floor: data?.floor ?? 0,
      listed: data?.listed ?? items.length,
    }),
    [data, items.length]
  );

  return (
    <main className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-[400px] bg-white rounded-[32px] p-[12px] shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
        <div className="px-5 pt-5 pb-6 flex flex-col min-h-[780px]">
          <div className="flex justify-between items-center mb-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-zinc-400 text-xs font-bold tracking-wide uppercase hover:text-zinc-700 transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </Link>

            <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-zinc-300">
              Live Market
            </span>
          </div>

          <div className="mb-6">
            <h1 className="text-[28px] leading-none font-extrabold tracking-tight text-black mb-3">
              NFT Marketplace
            </h1>
            <p className="text-zinc-500 text-sm">
              Verified TEFT Supreme Collection
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-zinc-400 mb-2">
                Floor
              </p>
              <p className="text-xl font-black text-black">
                {formatSol(stats.floor)}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-zinc-400 mb-2">
                Listed
              </p>
              <p className="text-xl font-black text-black">{stats.listed}</p>
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-zinc-500">
                <Loader2 className="animate-spin" size={24} />
                <p className="text-sm font-medium">Loading marketplace...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center rounded-[28px] border border-zinc-200 bg-zinc-50 px-6 py-10">
              <p className="text-base font-bold text-black mb-2">
                Market temporarily unavailable
              </p>
              <p className="text-sm text-zinc-500 mb-5">{error}</p>

              <button
                onClick={loadMarket}
                className="inline-flex items-center gap-2 rounded-full bg-black text-white px-5 py-3 text-sm font-bold hover:opacity-90 transition"
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center rounded-[28px] border border-zinc-200 bg-zinc-50 px-6 py-10">
              <p className="text-base font-bold text-black mb-2">
                No active listings
              </p>
              <p className="text-sm text-zinc-500 mb-5">
                There are currently no TEFT Supreme NFTs listed.
              </p>

              <a
                href={MAGIC_EDEN_COLLECTION_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-black text-white px-5 py-3 text-sm font-bold hover:opacity-90 transition"
              >
                View on Magic Eden
                <ExternalLink size={16} />
              </a>
            </div>
          ) : (
            <>
              <div className="flex gap-4 overflow-x-auto pb-3 mb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {items.map((nft) => (
                  <div
                    key={nft.address}
                    className="min-w-[306px] rounded-[28px] overflow-hidden border border-zinc-200 bg-white shadow-[0_12px_30px_rgba(0,0,0,0.06)]"
                  >
                    <div className="aspect-square bg-zinc-100">
                      <img
                        src={nft.image || "/teft.png"}
                        alt={nft.name}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.src = "/teft.png";
                        }}
                      />
                    </div>

                    <div className="px-5 py-4">
                      <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-zinc-400 mb-2">
                        Price
                      </p>
                      <p className="text-[20px] leading-none font-black text-black mb-2">
                        {formatSol(nft.price)}
                      </p>
                      <p className="text-sm text-zinc-500 truncate">
                        {nft.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href={MAGIC_EDEN_COLLECTION_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-auto w-full h-[64px] rounded-[20px] bg-black text-white flex items-center justify-center gap-2 text-[15px] font-extrabold tracking-wide uppercase hover:opacity-90 transition"
              >
                Buy on Magic Eden
                <ExternalLink size={18} />
              </a>
            </>
          )}

          <div className="pt-8 text-center text-[11px] uppercase tracking-[0.22em] font-bold text-zinc-300">
            Solana Blockchain
          </div>
        </div>
      </div>
    </main>
  );
}
