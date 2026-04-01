"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Share2, ChevronDown, RefreshCw, ExternalLink, Users, Mail, Info, ShieldAlert, Zap, Wallet, Droplets, Copy, Check } from "lucide-react";
import Link from "next/link";
import { Connection, VersionedTransaction } from '@solana/web3.js';

export default function TeftPulse() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showOptions, setShowOptions] = useState(false);
  const [tradeSize, setTradeSize] = useState("0.1");
  const [copied, setCopied] = useState("");
  const [buyingStatus, setBuyingStatus] = useState<string | null>(null);

  const fetchSignals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/signals', { cache: 'no-store' });
      const data = await res.json();
      
      if (data.error === "HELIUS_KEY_MISSING") {
        alert("🚨 Helius API Key fehlt in den Vercel Environment Variables!");
        setLoading(false);
        return;
      }

      if (data.signals) {
        setTokens(data.signals);
      }
      setLastUpdate(new Date());
    } catch (e) { 
      console.error("Fetch Error:", e); 
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, 20000); // Alle 20s Auto-Refresh
    return () => clearInterval(interval);
  }, []);

  const copyAddr = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(addr);
    setTimeout(() => setCopied(""), 2000);
  };

  const executeInstantBuy = async (addr: string, tick: string) => {
    setBuyingStatus(tick);
    try {
      const provider = (window as any).solana;
      if (!provider) return alert("Phantom Wallet?");
      await provider.connect();
      // Hier würde die Jupiter Logik greifen
      alert(`Simulierter Kauf von ${tradeSize} SOL in ${tick}...`);
    } catch (e: any) { alert(e.message); }
    setBuyingStatus(null);
  };

  return (
    <main className="min-h-screen bg-[#0f1112] text-[#9ca3af] font-sans antialiased">
      {/* BACKGROUND SECTION */}
      <div className="relative w-full h-[300px] overflow-hidden">
        <img src="/teft.png" className="w-full h-full object-cover opacity-20 grayscale contrast-125" alt="TEFT" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1112] via-[#0f1112]/40 to-transparent" />
        <div className="absolute top-6 left-6 z-20">
           <Link href="/" className="bg-black/60 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-2xl text-white font-bold text-xs flex items-center gap-2 uppercase tracking-widest hover:bg-white/10 transition-all">
              <ArrowLeft className="w-4 h-4" /> Gateway
           </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10 pb-20">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">TEFT Pulse</h1>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
               <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping" /> Live Alpha Stream v1.6
            </p>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center bg-[#161819] rounded-2xl border border-white/5 h-[50px] px-4 flex-1 md:flex-none">
               <Wallet className="w-4 h-4 text-zinc-700 mr-2" />
               <input type="number" step="0.1" value={tradeSize} onChange={(e) => setTradeSize(e.target.value)} className="bg-transparent text-white w-12 font-black outline-none text-sm" />
               <span className="text-[10px] font-black text-zinc-800 ml-2 uppercase">SOL</span>
            </div>
            <button onClick={fetchSignals} className="p-3.5 bg-[#161819] rounded-2xl border border-white/5 hover:bg-white/5 transition-all text-orange-500">
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* TERMINAL TABLE */}
        <div className="bg-[#161819] rounded-[2rem] border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden">
          <div className="flex justify-between items-center px-8 py-6 border-b border-white/5 bg-black/20">
             <div className="flex gap-8">
                <button className="text-white text-[11px] font-black uppercase border-b-2 border-orange-500 pb-6 -mb-6 tracking-widest">Pulse Feed</button>
                <button onClick={() => setShowOptions(!showOptions)} className="text-zinc-600 text-[11px] font-black uppercase flex items-center gap-2 hover:text-white transition-colors tracking-widest">
                   Options <ChevronDown className={`w-3 h-3 ${showOptions ? 'rotate-180' : ''}`} />
                </button>
             </div>
             <div className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.2em]">Sync: {lastUpdate.toLocaleTimeString()}</div>
          </div>

          {showOptions && (
            <div className="p-8 bg-[#1a1d1e] border-b border-white/5 grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-top-2">
              <div>
                <h3 className="text-white text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2"><ShieldAlert className="w-3 h-3 text-orange-500" /> Hard Filters (The Gate)</h3>
                <ul className="space-y-2 text-[11px] text-zinc-500 font-bold uppercase tracking-tighter italic">
                   <li>✓ Strictly Solana Native</li>
                   <li>✓ Max 15 Min Age Filter</li>
                   <li>✓ Pump.fun Launches Only</li>
                </ul>
              </div>
              <div>
                <h3 className="text-white text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2"><Info className="w-3 h-3 text-blue-500" /> Pulse Engine Scoring</h3>
                <ul className="space-y-2 text-[11px] text-zinc-500 font-bold uppercase tracking-tighter italic">
                   <li>+ Velocity: Volume/MCap Ratio</li>
                   <li>+ Liquidity Depth Check</li>
                   <li>+ Helius DAS Verification</li>
                </ul>
              </div>
            </div>
          )}

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
              {tokens.length === 0 && !loading && (
                 <tr><td colSpan={5} className="py-20 text-center text-xs font-bold text-zinc-700 uppercase italic tracking-widest">Scanning for high-conviction signals...</td></tr>
              )}
              {tokens.map((t: any, i) => (
                <tr key={i} className={`hover:bg-white/[0.03] transition-colors group border-l-2 ${t.isSafe ? 'border-green-500' : 'border-red-500/30'}`}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        {t.image ? (
                          <img src={t.image} className="w-11 h-11 rounded-full border border-white/10 shadow-2xl object-cover" alt="logo" />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 font-black text-xs">{t.ticker[0]}</div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0f1112] rounded-full flex items-center justify-center border border-white/5">
                           <div className={`w-2 h-2 rounded-full animate-pulse ${t.isSafe ? 'bg-green-500' : 'bg-red-500'}`} />
                        </div>
                      </div>
                      <div>
                        <div className={`text-[14px] font-black uppercase tracking-tight line-clamp-1 ${t.isSafe ? 'text-white' : 'text-zinc-500'}`}>{t.name}</div>
                        <div className="flex items-center gap-3 mt-1">
                           <button onClick={() => copyAddr(t.address)} className="text-[10px] font-bold text-zinc-600 hover:text-white flex items-center gap-1 uppercase tracking-widest transition-colors">
                              {copied === t.address ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />} {t.address.slice(0,4)}...
                           </button>
                           {t.isSafe ? <span className="text-[9px] text-green-500 font-black tracking-widest uppercase">● Safe</span> : <span className="text-[9px] text-red-500/50 font-black tracking-widest uppercase">● Risky</span>}
                           <a href={t.dexUrl} target="_blank" className="text-zinc-700 hover:text-white transition-colors"><ExternalLink className="w-3 h-3" /></a>
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-6 text-center">
                    <div className="flex flex-col items-center">
                        <span className="bg-white/5 text-white px-3 py-1 rounded-full text-[11px] font-black border border-white/5">
                            {t.age}
                        </span>
                        <span className="text-[8px] text-zinc-600 mt-1 uppercase font-bold tracking-widest">Live Now</span>
                    </div>
                  </td>

                  <td className="px-4 py-6 text-[15px] font-black text-white tracking-tighter">{t.mcap}</td>
                  <td className="px-4 py-6">
                    <div className={`text-[15px] font-black tracking-tighter ${t.isSafe ? 'text-blue-400' : 'text-zinc-600'}`}>{t.liq}</div>
                    <div className="flex items-center gap-3 mt-1.5 opacity-50">
                       <span className="text-[10px] font-bold text-zinc-600 flex items-center gap-1 uppercase"><Users className="w-3 h-3" /> {t.holders}</span>
                       <span className="text-[10px] font-bold text-zinc-600 flex items-center gap-1 uppercase"><Droplets className="w-3 h-3" /> {t.vol}</span>
                    </div>
                  </td>

                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => executeInstantBuy(t.address, t.ticker)}
                      disabled={buyingStatus === t.ticker}
                      className="inline-flex rounded-xl overflow-hidden border border-white/10 shadow-2xl group/btn hover:scale-[1.02] transition-all"
                    >
                      <span className="px-4 py-3 text-[11px] font-black uppercase bg-zinc-800 text-zinc-400 group-hover:text-white transition-colors tracking-tighter">
                        {buyingStatus === t.ticker ? '...' : `Score ${t.score}`}
                      </span>
                      <span className={`px-6 py-3 text-[11px] font-black text-black flex items-center gap-2 transition-colors uppercase italic tracking-widest ${t.isSafe ? 'bg-orange-500 group-hover:bg-orange-400' : 'bg-zinc-700 group-hover:bg-zinc-600'}`}>
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
        <p className="mt-10 text-center text-[9px] text-zinc-600 font-black uppercase tracking-[0.4em] leading-relaxed">
           Real-Time Analysis Powered by TEFT Legion Core <br/>
           Data: DexScreener L1 Stream | Enrichment: Helius DAS API
        </p>
      </div>
    </main>
  );
}
