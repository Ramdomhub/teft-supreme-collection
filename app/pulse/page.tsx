"use client";
import { ArrowLeft, ExternalLink, Activity, Info } from "lucide-react";
import Link from "next/link";

export default function TeftPulse() {
  const signals = [
    { name: "Mythos", ticker: "MTHOS", age: "2 min", mcap: "$17,340", vol: "$8,720", holders: "599", status: "Strong", score: 89, color: "text-green-400 bg-green-400/10 border-green-400/20" },
    { name: "LaserDogs", ticker: "DOGS", age: "4 min", mcap: "$35,200", vol: "$7,210", holders: "441", status: "Watch", score: 71, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
    { name: "SWAG Symbol", ticker: "SWAG", age: "3 min", mcap: "$12,880", vol: "$5,330", holders: "343", status: "Watch", score: 68, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
    { name: "Sigma63", ticker: "SIGMA", age: "8 min", mcap: "$7,640", vol: "$4,960", holders: "277", status: "Watch", score: 66, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
    { name: "Faded", ticker: "FADED", age: "4 min", mcap: "$25,900", vol: "$4,840", holders: "299", status: "Watch", score: 63, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans antialiased p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <Link href="/" className="flex items-center text-zinc-500 text-sm font-bold hover:text-white transition-all mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Gateway
            </Link>
            <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
              TEFT Pulse <span className="text-xs bg-white/10 text-white/50 px-2 py-1 rounded-md tracking-widest uppercase font-black">Beta</span>
            </h1>
            <p className="text-zinc-500 mt-2 text-lg">See what others don't.</p>
          </div>
          
          <div className="flex gap-2">
             <div className="bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 flex items-center gap-3 shadow-xl">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Live Signals</span>
             </div>
          </div>
        </div>

        {/* MAIN TERMINAL CARD */}
        <div className="bg-zinc-900/30 border border-white/5 rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-xl">
          
          {/* TAB BAR */}
          <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 bg-white/[0.02]">
            <div className="flex gap-6">
              <button className="text-white font-bold text-sm border-b-2 border-white pb-4 -mb-4.5">Feed</button>
              <button className="text-zinc-500 font-bold text-sm hover:text-zinc-300 transition-colors">Options</button>
              <button className="text-zinc-700 font-bold text-sm flex items-center gap-1 cursor-not-allowed">
                 <Activity className="w-3 h-3" /> soon
              </button>
            </div>
            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
              Updated 16 seconds ago
            </div>
          </div>

          {/* TABLE AREA */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] uppercase tracking-widest text-zinc-500 border-b border-white/5">
                  <th className="px-8 py-5 font-black">Token</th>
                  <th className="px-4 py-5 font-black">Age</th>
                  <th className="px-4 py-5 font-black">MCap</th>
                  <th className="px-4 py-5 font-black">Volume</th>
                  <th className="px-8 py-5 font-black text-right">Signal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {signals.map((s, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-white group-hover:border-white/30 transition-all">
                          {s.ticker[0]}
                        </div>
                        <div>
                          <div className="text-white font-bold">{s.name}</div>
                          <div className="text-[10px] text-zinc-500 font-black tracking-widest uppercase">{s.ticker}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-6 text-sm font-medium">{s.age}</td>
                    <td className="px-4 py-6 text-sm font-bold text-zinc-200">{s.mcap}</td>
                    <td className="px-4 py-6">
                       <div className="text-sm font-bold text-zinc-200">{s.vol}</div>
                       <div className="text-[10px] text-zinc-600 font-bold flex items-center gap-1">
                          👥 {s.holders}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="inline-flex items-center overflow-hidden rounded-lg border border-white/5">
                          <span className={`px-3 py-1.5 text-[11px] font-black uppercase tracking-tighter ${s.color}`}>
                            {s.status}
                          </span>
                          <span className="bg-zinc-800 px-3 py-1.5 text-[11px] font-black text-white border-l border-white/5">
                            {s.score}
                          </span>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FOOTER MESSAGE */}
          <div className="p-8 border-t border-white/5 text-center">
             <p className="text-xs text-zinc-600 font-medium italic">
                Many of these will fail. Don't trust – verify. Signal fee applies.
             </p>
          </div>
        </div>
      </div>
    </main>
  );
}
