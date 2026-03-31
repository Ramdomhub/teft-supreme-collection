"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, RefreshCw, ExternalLink, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function TeftPulse() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchLivePulse = async () => {
    setLoading(true);
    try {
      // Wir ziehen die aktuellsten Solana-Paare von DexScreener
      const response = await fetch('https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112');
      const data = await response.json();
      
      if (data.pairs) {
        // Wir filtern und sortieren nach Volumen
        const sorted = data.pairs
          .filter((p: any) => p.baseToken.symbol !== "SOL")
          .slice(0, 10)
          .map((p: any) => ({
            name: p.baseToken.name,
            symbol: p.baseToken.symbol,
            price: p.priceUsd,
            mcap: p.fdv,
            vol: p.volume.h24,
            url: p.url,
            // Echte Signal-Logik: Score basierend auf Volume/MCap Ratio
            score: Math.min(99, Math.floor((p.volume.h6 / p.fdv) * 1000) + 50)
          }));
        setTokens(sorted);
      }
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Pulse Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLivePulse();
    const interval = setInterval(fetchLivePulse, 30000); // Auto-Refresh alle 30 Sek
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-300 p-4 md:p-8 antialiased">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <Link href="/" className="text-zinc-500 text-sm font-bold hover:text-white flex items-center mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Gateway
            </Link>
            <h1 className="text-4xl font-black text-white tracking-tighter italic">TEFT PULSE</h1>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-1">Real-Time Solana Alpha</p>
          </div>
          <button onClick={fetchLivePulse} className="bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="bg-zinc-900/40 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-md shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-5">Pair</th>
                  <th className="px-4 py-5">Price</th>
                  <th className="px-4 py-5">Market Cap</th>
                  <th className="px-4 py-5">24h Vol</th>
                  <th className="px-8 py-5 text-right">Pulse Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tokens.map((t: any, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-black text-black">
                          {t.symbol[0]}
                        </div>
                        <div>
                          <div className="text-white font-bold text-sm">{t.symbol}</div>
                          <div className="text-[10px] text-zinc-500">{t.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-6 font-mono text-sm text-green-400">${Number(t.price).toFixed(6)}</td>
                    <td className="px-4 py-6 font-bold text-zinc-200 text-sm">${Number(t.mcap).toLocaleString()}</td>
                    <td className="px-4 py-6 font-medium text-zinc-400 text-sm">${Number(t.vol).toLocaleString()}</td>
                    <td className="px-8 py-6 text-right">
                       <a href={t.url} target="_blank" className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-2 rounded-lg group hover:bg-orange-500 hover:text-black transition-all">
                          <span className="text-sm font-black italic">{t.score}</span>
                          <TrendingUp className="w-4 h-4" />
                       </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-6 text-center text-[10px] text-zinc-600 font-black tracking-widest uppercase">
          Last Global Update: {lastUpdate.toLocaleTimeString()} · Data via DexScreener API
        </div>
      </div>
    </main>
  );
}
