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

      if (data.signals) setTokens(data.signals);
      setLastUpdate(new Date());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, 20000);
    return () => clearInterval(interval);
  }, []);

  const copyAddr = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(addr);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <main className="min-h-screen bg-[#0f1112] text-[#9ca3af] font-sans antialiased">
      <div className="relative w-full h-[300px] overflow-hidden">
        <img src="/teft.png" className="w-full h-full object-cover opacity-20 grayscale" alt="TEFT" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1112] to-transparent" />
        <div className="absolute top-6 left-6">
           <Link href="/" className="bg-black/60 border border-white/10 px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-2 uppercase tracking-widest hover:bg-white/10">
              <ArrowLeft className="w-4 h-4" /> Gateway
           </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">TEFT Pulse</h1>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
               <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping" /> Live Alpha Stream v1.5
            </p>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center bg-[#161819] rounded-2xl border border-white/5 h-[50px] px-4 flex-1 md:flex-none">
               <Wallet className="w-4 h-4 text-zinc-700 mr-2" />
               <input type="number" step="0.1" value={tradeSize} onChange={(e) => setTradeSize(e.target.value)} className="bg-transparent text-white w-12 font-black outline-none text-sm" />
               <span className="text-[10px] font-black text-zinc-800 ml-2">SOL</span>
            </div>
            <button onClick={fetchSignals} className="p-3.5 bg-[#161819] rounded-2xl border border-white/5 hover:bg-white/5 transition-all text-orange-500">
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="bg-[#161819] rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center px-8 py-6 border-b border-white/5 bg-black/20">
             <div className="flex gap-8">
                <button className="text-white text-[11px] font-black uppercase border-b-2 border-orange-500 pb-6 -mb-6">Pulse Feed</button>
                <button onClick={() => setShowOptions(!showOptions)} className="text-zinc-600 text-[11px] font-black uppercase flex items-center gap-2 hover:text-white transition-colors">
                   Options <ChevronDown className={`w-3 h-3 ${showOptions ? 'rotate-180' : ''}`} />
                </button>
             </div>
             <div className="text-[10px] text-zinc-700 font-bold uppercase">Sync: {lastUpdate.toLocaleTimeString()}</div>
          </div>

          {showOptions && (
            <div className="p-8 bg-[#1a1d1e] border-b border-white/5 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <h3 className="text-white text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2"><ShieldAlert className="w-3 h-3 text-orange-500" /> Hard Filters (The Gate)</h3>
                <ul className="space-y-2 text-[11px] text-zinc-500 font-bold uppercase tracking-tighter italic">
                   <li>✓ Strictly Solana Native</li>
                   <li>✓ Max 15 Min Age Filter (Test)</li>
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
                <tr className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] border-b border-white/5 bg-black/10">
                  <th className="px-8 py-5 font-black">Token Alpha</th>
                  <th className="px-4 py-5 font-black text-center">Age</th>
                  <th className="px-4 py-5 font-black">Market Cap</th>
                  <th className="px-4 py-5 font-black">Liquidity / Vol</th>
                  <th className="px-8 py-5 font-black text-right">Execution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tokens.length === 0 && !loading && (
                  <tr><td colSpan={5} className="py-20 text-center text-xs font-bold text-zinc-700 uppercase italic">Scanning for high-conviction signals...</td></tr>
                )}
                {tokens.map((t: any, i) => (
                  <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        {t.image ? <img src={t.image} className="w-10 h-10 rounded-full object-cover border border-white/10" /> : <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold">{t.ticker[0]}</div>}
                        <div>
                          <div className="text-sm font-black text-white uppercase">{t.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <button onClick={() => copyAddr(t.address)} className="text-[10px] text-zinc-600 hover:text-white flex items-center gap-1 uppercase font-bold">
                              {copied === t.address ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />} {t.address.slice(0,4)}...
                            </button>
                            <a href={t.dexUrl} target="_blank" className="text-zinc-700 hover:text-white"><ExternalLink className="w-3 h-3" /></a>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-6 text-center">
                       <span className="bg-orange-500/20 text-orange-500 px-3 py-1 rounded-full text-[11px] font-black border border-orange-500/30 animate-pulse">{t.age}</span>
                    </td>
                    <td className="px-4 py-6 text-[15px] font-black text-white tracking-tighter">{t.mcap}</td>
                    <td className="px-4 py-6">
                      <div className="text-[15px] font-black text-blue-400 tracking-tighter">{t.liq}</div>
                      <div className="text-[10px] font-bold text-zinc-600 mt-1 uppercase flex items-center gap-1"><Droplets className="w-3 h-3" /> {t.vol}</div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="inline-flex rounded-xl overflow-hidden border border-white/10 group/btn">
                        <span className="px-4 py-3 text-[10px] font-black uppercase bg-zinc-800 text-zinc-400 group-hover:text-white transition-colors">Score {t.score}</span>
                        <span className="bg-orange-500 px-6 py-3 text-[10px] font-black text-black flex items-center gap-2 group-hover:bg-orange-400 uppercase italic tracking-widest">
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
