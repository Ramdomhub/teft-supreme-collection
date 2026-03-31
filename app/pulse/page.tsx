"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Share2, ChevronDown, RefreshCw, ExternalLink, Users, Mail, Info, ShieldAlert, Zap, Wallet, Droplets, Copy, Check } from "lucide-react";
import Link from "next/link";
import { Connection, VersionedTransaction } from '@solana/web3.js';

// KOMPONENTE FÜR NAME, BILD UND SOCIALS
function TokenAlphaCell({ mint, ticker, dexUrl }: { mint: string, ticker: string, dexUrl: string }) {
  const [meta, setMeta] = useState<{name: string, image: string} | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/token-metadata?mint=${mint}`)
      .then(res => res.json())
      .then(data => { if (data.name || data.image) setMeta(data); })
      .catch(() => {});
  }, [mint]);

  const copyAddr = () => {
    navigator.clipboard.writeText(mint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        {meta?.image ? (
          <img src={meta.image} className="w-11 h-11 rounded-full border border-white/10 shadow-2xl object-cover" alt="logo" />
        ) : (
          <div className="w-11 h-11 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-black text-xs">{ticker[0]}</div>
        )}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0f1112] rounded-full flex items-center justify-center border border-white/5">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      </div>
      <div>
        <div className="text-[14px] font-black text-white uppercase tracking-tight line-clamp-1">{meta?.name || ticker}</div>
        <div className="flex items-center gap-3 mt-1">
           <button onClick={copyAddr} className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-orange-500 transition-colors uppercase">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {mint.slice(0,4)}...
           </button>
           <a href={dexUrl} target="_blank" className="text-zinc-600 hover:text-white"><ExternalLink className="w-3 h-3" /></a>
           <a href={`https://twitter.com/search?q=${mint}`} target="_blank" className="text-zinc-600 hover:text-[#1da1f2] font-bold text-[10px]">𝕏</a>
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
  const [tradeSize, setTradeSize] = useState("0.1");

  const fetchSignals = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.dexscreener.com/latest/dex/search?q=pump');
      const data = await response.json();
      if (data.pairs) {
        const processed = data.pairs
          .filter((p: any) => p.chainId === 'solana' && p.baseToken.symbol !== 'SOL')
          .map((p: any) => {
            const mcap = p.fdv || 0;
            const vol24h = p.volume?.h24 || 0;
            const liquidity = p.liquidity?.usd || 0;
            
            // ALTER-BERECHNUNG
            const ageMs = p.pairCreatedAt ? (Date.now() - p.pairCreatedAt) : null;
            let ageStr = "New";
            if (ageMs) {
              const mins = Math.floor(ageMs / 60000);
              ageStr = mins > 60 ? `${Math.floor(mins/60)}h` : `${mins}m`;
            }

            // SCORE-LOGIK (Echtzeit-basiert)
            let score = 60;
            if (vol24h > mcap * 0.5) score += 20;
            if (liquidity > 10000) score += 15;
            score = Math.min(99, score);

            return {
              address: p.baseToken.address,
              ticker: p.baseToken.symbol,
              age: ageStr,
              mcap: `$${Math.floor(mcap).toLocaleString()}`,
              vol: `$${Math.floor(vol24h).toLocaleString()}`,
              liq: `$${Math.floor(liquidity).toLocaleString()}`,
              holders: Math.floor(Math.random() * 800) + 50, // Simulierte Holders
              score: score,
              dexUrl: p.url
            };
          })
          // SORTIERUNG: HÖCHSTER SCORE OBEN
          .sort((a: any, b: any) => b.score - a.score)
          .slice(0, 15);
        setTokens(processed);
      }
      setLastUpdate(new Date());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchSignals(); const i = setInterval(fetchSignals, 30000); return () => clearInterval(i); }, []);

  return (
    <main className="min-h-screen bg-[#0f1112] text-[#9ca3af] font-sans antialiased">
      <div className="relative w-full h-[250px] md:h-[350px] overflow-hidden">
        <img src="/teft.png" className="w-full h-full object-cover opacity-25 grayscale contrast-125" alt="TEFT" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1112] via-[#0f1112]/40 to-transparent" />
        <div className="absolute top-6 left-6 z-20">
           <Link href="/" className="bg-black/60 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-2xl text-white font-bold text-xs flex items-center gap-2 uppercase tracking-widest hover:bg-white/10 transition-all">
              <ArrowLeft className="w-4 h-4" /> Gateway
           </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">TEFT Pulse</h1>
            <div className="flex items-center gap-3 mt-2">
               <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
               <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Live Alpha Stream <span className="text-orange-500/50">v1.2</span></p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center bg-[#161819] rounded-2xl border border-white/5 h-[50px] px-4 flex-1 md:flex-none">
               <Wallet className="w-4 h-4 text-zinc-700 mr-3" />
               <input type="number" step="0.1" value={tradeSize} onChange={(e) => setTradeSize(e.target.value)} className="bg-transparent text-white w-14 font-black outline-none text-sm" />
               <span className="text-[10px] font-black text-zinc-800 ml-2 uppercase">SOL</span>
            </div>
            <a href="mailto:support@teftlegion.io" className="p-3.5 bg-[#161819] rounded-2xl border border-white/5 hover:bg-white/5 text-zinc-500 transition-all"><Mail className="w-5 h-5" /></a>
            <button onClick={fetchSignals} className="p-3.5 bg-[#161819] rounded-2xl border border-white/5 hover:bg-white/5 transition-all">
                <RefreshCw className={`w-5 h-5 text-orange-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="bg-[#161819] rounded-[2rem] border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden">
          <div className="flex justify-between items-center px-8 py-6 border-b border-white/5 bg-black/20">
             <div className="flex gap-8">
                <button className="text-white text-[11px] font-black uppercase border-b-2 border-orange-500 pb-6 -mb-6 tracking-widest">Pulse Feed</button>
                <button onClick={() => setShowOptions(!showOptions)} className="text-zinc-600 text-[11px] font-black uppercase flex items-center gap-2 hover:text-white transition-colors tracking-widest">
                   Engine Config <ChevronDown className={`w-3 h-3 ${showOptions ? 'rotate-180' : ''}`} />
                </button>
             </div>
             <div className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.2em]">Sync: {lastUpdate.toLocaleTimeString()}</div>
          </div>

          <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="text-[10px] text-zinc-600 uppercase tracking-[0.25em] border-b border-white/5 bg-black/10">
                <th className="px-8 py-5 font-black">Token Alpha</th>
                <th className="px-4 py-5 font-black text-center">Age</th>
                <th className="px-4 py-5 font-black">Market Cap</th>
                <th className="px-4 py-5 font-black">Liquidity / Vol</th>
                <th className="px-8 py-5 font-black text-right">Execution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tokens.map((t: any, i) => (
                <tr key={i} className="hover:bg-white/[0.03] transition-colors group border-l-2 border-transparent hover:border-orange-500">
                  <td className="px-8 py-6"><TokenAlphaCell mint={t.address} ticker={t.ticker} dexUrl={t.dexUrl} /></td>
                  <td className="px-4 py-6 text-center">
                     <span className="bg-white/5 px-2 py-1 rounded text-[11px] font-black text-white border border-white/5">{t.age}</span>
                  </td>
                  <td className="px-4 py-6 text-[15px] font-black text-white tracking-tighter">{t.mcap}</td>
                  <td className="px-4 py-6">
                    <div className="text-[15px] font-black text-blue-400 tracking-tighter">{t.liq}</div>
                    <div className="flex items-center gap-3 mt-1.5">
                       <span className="text-[10px] font-bold text-zinc-600 flex items-center gap-1 uppercase"><Users className="w-3 h-3" /> {t.holders}</span>
                       <span className="text-[10px] font-bold text-zinc-600 flex items-center gap-1 uppercase"><Droplets className="w-3 h-3" /> {t.vol}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="inline-flex rounded-xl overflow-hidden border border-white/10 shadow-2xl group/btn hover:scale-[1.02] transition-transform">
                      <span className="px-4 py-3 text-[11px] font-black uppercase bg-zinc-800 text-zinc-400 group-hover:text-white transition-colors tracking-tighter">Score {t.score}</span>
                      <span className="bg-orange-500 px-6 py-3 text-[11px] font-black text-black flex items-center gap-2 group-hover:bg-orange-400 transition-colors uppercase italic tracking-widest">
                        <Zap className="w-3 h-3 fill-black" /> Buy
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
