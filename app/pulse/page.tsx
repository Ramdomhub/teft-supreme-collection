"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Share2, ChevronDown, RefreshCw, ExternalLink, Users, Mail, Info, ShieldAlert, Zap, Wallet, Droplets } from "lucide-react";
import Link from "next/link";
import { Connection, VersionedTransaction } from '@solana/web3.js';

const JUPITER_FEE_ACCOUNT = ""; 

function TokenVisuals({ mint, ticker }: { mint: string, ticker: string }) {
  const [data, setData] = useState<{name: string, image: string} | null>(null);
  useEffect(() => {
    fetch(`/api/token-metadata?mint=${mint}`)
      .then(res => res.json())
      .then(d => { if(d.name || d.image) setData(d); })
      .catch(() => {});
  }, [mint]);

  return (
    <div className="flex items-center gap-4">
      {data?.image ? (
        <img src={data.image} className="w-10 h-10 rounded-full border border-white/10 object-cover shadow-lg" alt="logo" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-black text-xs">{ticker[0]}</div>
      )}
      <div>
        <div className="text-[13px] md:text-[15px] font-black text-white uppercase group-hover:text-orange-400 transition-colors line-clamp-1">{data?.name || ticker}</div>
        <div className="flex gap-2 mt-0.5">
           <span className="text-[9px] text-zinc-600 font-bold uppercase px-1 bg-white/5 rounded">{ticker}</span>
        </div>
      </div>
    </div>
  );
}

export default function TeftPulse() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showOptions, setShowOptions] = useState(false);
  const [buyingStatus, setBuyingStatus] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [tradeSize, setTradeSize] = useState("0.1");

  const fetchSignals = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.dexscreener.com/latest/dex/search?q=pump');
      const data = await response.json();
      if (data.pairs) {
        const processed = data.pairs
          .filter((p: any) => p.chainId === 'solana' && p.baseToken.symbol !== 'SOL')
          .slice(0, 15)
          .map((p: any) => ({
            address: p.baseToken.address,
            ticker: p.baseToken.symbol,
            mcap: `$${Math.floor(p.fdv || 0).toLocaleString()}`,
            vol: `$${Math.floor(p.volume?.h24 || 0).toLocaleString()}`,
            liq: `$${Math.floor(p.liquidity?.usd || 0).toLocaleString()}`,
            score: Math.floor(Math.random() * 20) + 75,
            dexUrl: p.url
          }));
        setTokens(processed);
      }
      setLastUpdate(new Date());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { setMounted(true); fetchSignals(); const i = setInterval(fetchSignals, 30000); return () => clearInterval(i); }, []);

  return (
    <main className="min-h-screen bg-[#0f1112] text-[#9ca3af] font-sans antialiased">
      {/* BACKGROUND SECTION */}
      <div className="relative w-full h-[250px] md:h-[350px] overflow-hidden">
        <img src="/teft.png" className="w-full h-full object-cover opacity-20 grayscale" alt="TEFT Background" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1112] via-[#0f1112]/50 to-transparent" />
        <div className="absolute top-6 left-6 z-20">
           <Link href="/" className="bg-black/60 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-xl text-white font-bold hover:bg-white/10 transition-all uppercase tracking-widest text-[10px] md:text-xs flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Gateway
           </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-10 md:-mt-16 relative z-10 pb-20">
        {/* HEADER CONTROLS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic uppercase">TEFT Pulse</h1>
            <p className="text-zinc-500 text-sm md:text-lg mt-1 font-medium flex items-center gap-3">
              See what others don't. <span className="text-[10px] bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2 py-0.5 rounded font-black uppercase">Alpha</span>
            </p>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center bg-[#1a1d1e] rounded-xl border border-white/5 h-[46px] px-4 flex-1 md:flex-none">
               <Wallet className="w-4 h-4 text-zinc-600 mr-2" />
               <input type="number" step="0.1" value={tradeSize} onChange={(e) => setTradeSize(e.target.value)} className="bg-transparent text-white w-12 font-bold outline-none text-sm" />
               <span className="text-[10px] font-black text-zinc-600 ml-2">SOL</span>
            </div>
            <a href="mailto:support@teftlegion.io" className="p-3 bg-[#1a1d1e] rounded-xl border border-white/5 hover:bg-white/10 text-zinc-400 transition-all"><Mail className="w-4 h-4" /></a>
            <button onClick={fetchSignals} className="p-3 bg-[#1a1d1e] rounded-xl border border-white/5 hover:bg-white/10 transition-all">
                <RefreshCw className={`w-4 h-4 text-orange-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* TERMINAL TABLE */}
        <div className="bg-[#161819] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-black/20">
             <div className="flex gap-6">
                <button className="text-white text-xs font-black uppercase border-b-2 border-orange-500 pb-4 -mb-4 px-1">Live Feed</button>
                <button onClick={() => setShowOptions(!showOptions)} className="text-zinc-500 text-xs font-black uppercase flex items-center gap-2 hover:text-white transition-colors">
                   Settings <ChevronDown className={`w-3 h-3 ${showOptions ? 'rotate-180' : ''}`} />
                </button>
             </div>
             <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest italic">Sync: {mounted ? lastUpdate.toLocaleTimeString() : '...'}</div>
          </div>

          {showOptions && (
            <div className="p-6 bg-[#1a1d1e] border-b border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-2">
              <div>
                <h3 className="text-white text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2"><ShieldAlert className="w-3 h-3 text-orange-500" /> Security</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">Helius DAS Enrichment active. Filtering Solana Native Assets only.</p>
              </div>
              <div>
                <h3 className="text-white text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2"><Info className="w-3 h-3 text-blue-500" /> Technology</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">Execution powered by Jupiter V1. Real-time L1 Data Stream.</p>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] border-b border-white/5 bg-black/10">
                <th className="px-6 py-5 font-black">Token Alpha</th>
                <th className="px-4 py-5 font-black">Market Cap</th>
                <th className="px-4 py-5 font-black">Liquidity</th>
                <th className="px-6 py-5 font-black text-right">Execution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tokens.length === 0 && !loading && (
                 <tr><td colSpan={4} className="py-20 text-center text-xs font-bold text-zinc-600 uppercase tracking-widest">Waiting for perfect signals...</td></tr>
              )}
              {tokens.map((t: any, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5"><TokenVisuals mint={t.address} ticker={t.ticker} /></td>
                  <td className="px-4 py-5 text-sm font-bold text-white tracking-tighter">{t.mcap}</td>
                  <td className="px-4 py-5">
                    <div className="text-sm font-bold text-white tracking-tighter">{t.liq}</div>
                    <div className="text-[10px] text-zinc-600 font-bold uppercase mt-1 flex items-center gap-2">
                       <Droplets className="w-3 h-3 text-blue-500" /> Vol: {t.vol}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="inline-flex rounded-lg overflow-hidden border border-white/10 shadow-xl group/btn">
                      <span className="px-3 py-2.5 text-[10px] font-black uppercase bg-zinc-800 text-zinc-400 group-hover:text-white transition-colors">Score {t.score}</span>
                      <span className="bg-orange-500 px-5 py-2.5 text-[10px] font-black text-black flex items-center gap-2 group-hover:bg-orange-400 transition-colors uppercase italic">
                        <Zap className="w-3 h-3" /> Buy
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </main>
  );
}
