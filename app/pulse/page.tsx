"use client";

import React, { useState, useEffect } from 'react';
import { Copy, Zap, RefreshCw, ArrowUpRight } from 'lucide-react';

export default function PulsePage() {
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tradeSize] = useState("0.5 SOL");

  const fetchSignals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/signals');
      const data = await res.json();
      if (data.signals) setSignals(data.signals);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, 30000);
    return () => clearInterval(interval);
  }, []);

  const copyAddr = (addr: string) => {
    navigator.clipboard.writeText(addr);
  };

  return (
    <main className="min-h-screen bg-[#0f1112] text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-8">
          <div className="flex items-center gap-4">
            <div className="bg-orange-500 p-2 rounded-lg">
              <Zap className="w-6 h-6 text-black fill-current" />
            </div>
            <div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter">TEFT PULSE</h1>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Live Alpha Stream v1.8</p>
            </div>
          </div>
          <button onClick={fetchSignals} className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/5 transition-all">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* TERMINAL TABLE */}
        <div className="bg-[#161819] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 border-b border-white/5">
                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Asset / Socials</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Age</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">MCap</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest">TEFT Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {signals.map((t, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {t.image ? (
                          <img src={t.image} className="w-12 h-12 rounded-full border-2 border-white/10 object-cover shadow-2xl" alt="logo" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-white font-black text-xs uppercase">{t.ticker?.[0]}</div>
                        )}
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#161819] ${t.isSafe ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-black text-white uppercase tracking-tight">{t.name}</span>
                          <span className="text-[10px] text-zinc-500 font-bold tracking-widest">{t.ticker}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <button onClick={() => copyAddr(t.address)} className="text-[9px] font-black text-zinc-600 hover:text-white uppercase flex items-center gap-1 transition-colors">
                            <Copy className="w-3 h-3" /> {t.address.slice(0,4)}...{t.address.slice(-4)}
                          </button>
                          <div className="flex gap-2 ml-2">
                            {t.twitter && (
                              <a href={t.twitter} target="_blank" className="p-1.5 bg-white/5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
                                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                              </a>
                            )}
                            {t.telegram && (
                              <a href={t.telegram} target="_blank" className="p-1.5 bg-white/5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
                                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-.99.53-1.41.52-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.88.03-.24.36-.49.99-.75 3.88-1.69 6.46-2.8 7.73-3.35 3.68-1.57 4.44-1.84 4.94-1.85.11 0 .35.03.5.16.13.1.17.24.18.34.02.06.02.13.01.19z"/></svg>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-mono text-sm text-zinc-400">{t.age}</td>
                  <td className="px-8 py-6 font-mono text-sm text-zinc-200">{t.mcap}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-[12px] font-black px-3 py-1 rounded-lg border shadow-lg ${t.score > 85 ? 'bg-green-500/20 text-green-500 border-green-500/30' : 'bg-orange-500/20 text-orange-500 border-orange-500/30'}`}>
                         SCORE {t.score}
                      </span>
                      <button className="bg-orange-500 hover:bg-orange-400 text-black px-5 py-2 rounded-xl text-[10px] font-black uppercase italic tracking-widest transition-all flex items-center gap-2">
                         Buy {tradeSize} <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
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
