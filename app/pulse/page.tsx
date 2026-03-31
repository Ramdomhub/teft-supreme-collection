"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Share2, MoreHorizontal, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function TeftPulse() {
  const [tokens, setTokens] = useState([
    { name: "Mythos", ticker: "MTHOS", age: "2 min", mcap: "$17,340", vol: "$8,720", holders: "599", status: "Strong", score: 89 },
    { name: "LaserDogs", ticker: "DOGS", age: "4 min", mcap: "$35,200", vol: "$7,210", holders: "441", status: "Watch", score: 71 },
    { name: "SWAG Symbol", ticker: "SWAG", age: "3 min", mcap: "$12,880", vol: "$5,330", holders: "343", status: "Watch", score: 68 },
    { name: "Sigma63", ticker: "SIGMA", age: "8 min", mcap: "$7,640", vol: "$4,960", holders: "277", status: "Watch", score: 66 },
    { name: "Faded", ticker: "FADED", age: "4 min", mcap: "$25,900", vol: "$4,840", holders: "299", status: "Watch", score: 63 },
  ]);

  return (
    <main className="min-h-screen bg-[#0f1112] text-[#9ca3af] font-sans antialiased selection:bg-orange-500/30">
      {/* HEADER IMAGE SECTION */}
      <div className="relative w-full h-[400px] overflow-hidden">
        <img src="/teft.png" className="w-full h-full object-cover opacity-40 grayscale-[0.5] contrast-[1.2]" alt="TEFT Background" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1112] via-transparent to-transparent" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
           <Link href="/" className="bg-black/40 backdrop-blur-md border border-white/10 px-8 py-3 rounded-xl text-white font-bold hover:bg-white/10 transition-all uppercase tracking-widest text-sm">
              Enter Gateway
           </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10 pb-20">
        {/* TITLE SECTION */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">TEFT Pulse</h1>
            <p className="text-zinc-500 text-lg mt-1 font-medium">See what others don't.</p>
          </div>
          <div className="flex bg-[#1a1d1e] rounded-xl p-1 border border-white/5 shadow-2xl">
             <button className="px-4 py-1.5 bg-[#2a2d2e] text-white rounded-lg text-sm font-bold flex items-center gap-2">
                <Share2 className="w-3.5 h-3.5" /> Feed
             </button>
             <button className="px-4 py-1.5 text-zinc-500 text-sm font-bold">Options</button>
             <button className="px-4 py-1.5 text-zinc-700 text-xs font-bold uppercase tracking-widest">soon</button>
          </div>
        </div>

        {/* TERMINAL TABLE */}
        <div className="bg-[#161819] rounded-2xl border border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-white/5">
             <div className="flex gap-8 text-[13px] font-bold uppercase tracking-wider">
                <span className="text-white border-b border-orange-500 pb-4 -mb-4">Feed</span>
                <span className="text-zinc-600">Options</span>
                <span className="text-zinc-800 flex items-center gap-1"><ChevronDown className="w-3 h-3"/> soon</span>
             </div>
             <div className="text-[11px] text-zinc-600 font-bold uppercase tracking-widest">Updated 16 seconds ago</div>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] text-zinc-600 uppercase tracking-widest border-b border-white/5">
                <th className="px-6 py-5 font-bold">Token</th>
                <th className="px-4 py-5 font-bold flex items-center gap-1">Age <ChevronDown className="w-3 h-3" /></th>
                <th className="px-4 py-5 font-bold flex items-center gap-1">MCap <ChevronDown className="w-3 h-3" /></th>
                <th className="px-4 py-5 font-bold flex items-center gap-1">Volume <ChevronDown className="w-3 h-3" /></th>
                <th className="px-6 py-5 font-bold text-right">Signal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tokens.map((t, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-all cursor-pointer group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden">
                        <div className="text-white font-bold text-xs uppercase tracking-tighter">{t.ticker[0]}</div>
                      </div>
                      <div>
                        <div className="text-[15px] font-bold text-white group-hover:text-orange-400 transition-colors">{t.name} <span className="text-[10px] text-zinc-600 ml-1 uppercase">{t.ticker}</span></div>
                        <div className="flex gap-2 mt-0.5">
                           <div className="w-3 h-3 bg-zinc-800 rounded flex items-center justify-center text-[8px]">𝕏</div>
                           <div className="w-3 h-3 bg-zinc-800 rounded flex items-center justify-center text-[8px]">✈</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-[14px] font-bold text-white">{t.age}</td>
                  <td className="px-4 py-5 text-[14px] font-bold text-white">{t.mcap}</td>
                  <td className="px-4 py-5">
                    <div className="text-[14px] font-bold text-white">{t.vol}</div>
                    <div className="text-[10px] text-zinc-600 font-bold flex items-center gap-1 tracking-tighter">👥 {t.holders}</div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="inline-flex rounded-lg overflow-hidden border border-white/5 shadow-lg">
                      <span className={`px-3 py-1.5 text-[11px] font-black uppercase tracking-tighter ${t.status === 'Strong' ? 'bg-[#1a2e26] text-[#4ade80]' : 'bg-[#2e2a1a] text-[#facc15]'}`}>
                        {t.status}
                      </span>
                      <span className="bg-[#1a1d1e] px-2 py-1.5 text-[11px] font-black text-white border-l border-white/5">
                        {t.score}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-10 text-center border-t border-white/5">
            <p className="text-[11px] text-zinc-700 font-bold uppercase tracking-[0.2em]">
              Many of these will fail. Don't trust – verify. Signal fee applies.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
