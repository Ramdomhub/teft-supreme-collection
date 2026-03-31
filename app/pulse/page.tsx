"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Share2, ChevronDown, RefreshCw, ExternalLink, Users, Mail, Info, ShieldAlert, Zap, Wallet, Droplets } from "lucide-react";
import Link from "next/link";
import { Connection, VersionedTransaction } from '@solana/web3.js';

// KOMPONENTE FÜR DAS HELIUS IMAGE
function TokenVisuals({ mint, fallback }: { mint: string, fallback: string }) {
  const [data, setData] = useState<{name: string, image: string} | null>(null);
  useEffect(() => {
    fetch(`/api/token-metadata?mint=${mint}`)
      .then(res => res.json())
      .then(d => setData(d))
      .catch(() => {});
  }, [mint]);

  return (
    <div className="flex items-center gap-4">
      {data?.image ? (
        <img src={data.image} className="w-10 h-10 rounded-full border border-white/10" alt="icon" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-black text-xs">{fallback}</div>
      )}
      <div>
        <div className="text-sm font-black text-white uppercase">{data?.name || 'Loading...'}</div>
        <div className="text-[10px] text-zinc-600 font-bold uppercase">{mint.slice(0,4)}...{mint.slice(-4)}</div>
      </div>
    </div>
  );
}

export default function TeftPulse() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tradeSize, setTradeSize] = useState("0.1");

  const fetchSignals = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://api.dexscreener.com/latest/dex/search?q=pump');
      const data = await res.json();
      const filtered = data.pairs
        .filter((p: any) => p.chainId === 'solana' && !p.baseToken.symbol.includes('SOL') && p.fdv < 1000000)
        .map((p: any) => ({
          address: p.baseToken.address,
          ticker: p.baseToken.symbol,
          mcap: `$${Math.floor(p.fdv).toLocaleString()}`,
          vol: `$${Math.floor(p.volume.h24).toLocaleString()}`,
          liq: `$${Math.floor(p.liquidity.usd).toLocaleString()}`,
          dexUrl: p.url
        })).slice(0, 10);
      setTokens(filtered);
    } catch (e) { setErrorMessage("Network Error"); }
    setLoading(false);
  };

  useEffect(() => { fetchSignals(); }, []);

  return (
    <main className="min-h-screen bg-[#0f1112] text-[#9ca3af] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <h1 className="text-4xl font-black text-white tracking-tighter italic">TEFT PULSE</h1>
          <div className="flex gap-2">
             <input type="number" value={tradeSize} onChange={e => setTradeSize(e.target.value)} className="bg-[#1a1d1e] border border-white/5 rounded-xl px-4 py-2 w-20 text-white font-bold" />
             <button onClick={fetchSignals} className="p-3 bg-orange-500 rounded-xl text-black font-bold"><RefreshCw className={loading ? "animate-spin" : ""} /></button>
          </div>
        </div>

        <div className="bg-[#161819] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-black/20 text-[10px] uppercase tracking-widest text-zinc-600">
              <tr>
                <th className="p-6">Token Alpha</th>
                <th className="p-6">MCap</th>
                <th className="p-6">Liquidity</th>
                <th className="p-6 text-right">Execution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tokens.map((t: any) => (
                <tr key={t.address} className="hover:bg-white/[0.02]">
                  <td className="p-6"><TokenVisuals mint={t.address} fallback={t.ticker[0]} /></td>
                  <td className="p-6 font-bold text-white">{t.mcap}</td>
                  <td className="p-6 font-bold text-blue-400">{t.liq}</td>
                  <td className="p-6 text-right">
                    <button className="bg-orange-500 text-black px-6 py-2 rounded-xl font-black text-xs uppercase italic hover:scale-105 transition-transform">Instant Buy</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
