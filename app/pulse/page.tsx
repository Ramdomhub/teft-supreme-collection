"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Share2, ChevronDown, RefreshCw, ExternalLink, Users, Mail, Zap, Wallet, Droplets, Copy, Check } from "lucide-react";
import Link from "next/link";
import { Connection, VersionedTransaction } from '@solana/web3.js';

const JUPITER_FEE_ACCOUNT = ""; 

// KOMPONENTE FÜR NAME, BILD UND SOCIALS (ENRICHMENT)
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
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />} {mint.slice(0,4)}...
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
  const [buyingStatus, setBuyingStatus] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [tradeSize, setTradeSize] = useState("0.1");

  const fetchSignals = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/signals', { cache: 'no-store' });
      const data = await response.json();
      if (data.signals) {
        setTokens(data.signals);
      }
      setLastUpdate(new Date());
    } catch (e) {
      console.error("Pulse Fetch Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchSignals();
    const interval = setInterval(fetchSignals, 15000); // 15s Auto-Refresh
    return () => clearInterval(interval);
  }, []);

  const shareToX = (token: any) => {
    const text = `🚨 TEFT Pulse Alert 🚨\n\n🟢 $${token.ticker} triggered a ${token.score} Score!\n⏱ Age: ${token.age} | 💰 MCap: ${token.mcap}\n\nFound by @TEFTlegion Pulse ⚡️\n${token.dexUrl}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const executeInstantBuy = async (addr: string, tick: string) => {
    setBuyingStatus(tick);
    try {
      const provider = (window as any).solana;
      if (!provider) return alert("Phantom Wallet?");
      await provider.connect();
      const lamports = Math.floor(parseFloat(tradeSize) * 10 ** 9);
      const quote = await (await fetch(`https://lite-api.jup.ag/swap/v1/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${addr}&amount=${lamports}&slippageBps=500`)).json();
      const { swapTransaction } = await (await fetch('https://lite-api.jup.ag/swap/v1/swap', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quoteResponse: quote, userPublicKey: provider.publicKey.toString() })
      })).json();
      const transaction = VersionedTransaction.deserialize(Buffer.from(swapTransaction, 'base64'));
      const signed = await provider.signTransaction(transaction);
      const conn = new Connection(process.env.NEXT_PUBLIC_HELIUS_RPC_URL || "https://api.mainnet-beta.solana.com");
      const txid = await conn.sendRawTransaction(signed.serialize(), { skipPreflight: true });
      alert(`TX: ${txid}`);
    } catch (e: any) { alert(e.message); }
    setBuyingStatus(null);
  };

  return (
    <main className="min-h-screen bg-[#0f1112] text-[#9ca3af] font-sans antialiased">
      {/* BACKGROUND */}
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
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">TEFT Pulse</h1>
            <div className="flex items-center gap-3 mt-2">
               <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
               <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Live Alpha Stream <span className="text-orange-500/50">v1.3</span></p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center bg-[#161819] rounded-2xl border border-white/5 h-[50px] px-4 flex-1 md:flex-none">
               <Wallet className="w-4 h-4 text-zinc-700 mr-3" />
               <input type="number" step="0.1" value={tradeSize} onChange={(e) => setTradeSize(e.target.value)} className="bg-transparent text-white w-14 font-black outline-none text-sm" />
               <span className="text-[10px] font-black text-zinc-800 ml-2 uppercase">SOL</span>
            </div>
            <button onClick={() => window.location.reload()} className="p-3.5 bg-[#161819] rounded-2xl border border-white/5 hover:bg-white/5 text-zinc-500 transition-all"><Share2 className="w-5 h-5" /></button>
            <a href="mailto:support@teftlegion.io" className="p-3.5 bg-[#161819] rounded-2xl border border-white/5 hover:bg-white/5 text-zinc-500 transition-all"><Mail className="w-5 h-5" /></a>
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
                   Config <ChevronDown className={`w-3 h-3 ${showOptions ? 'rotate-180' : ''}`} />
                </button>
             </div>
             <div className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.2em]">Sync: {mounted ? lastUpdate.toLocaleTimeString() : '...'}</div>
          </div>

          {showOptions && (
            <div className="p-6 bg-[#1a1d1e] border-b border-white/5 grid grid-cols-2 gap-8">
              <div className="text-xs text-zinc-500 italic uppercase font-bold tracking-widest">Filter: Strictly {'<'} 10 Min Age</div>
              <div className="text-xs text-zinc-500 italic uppercase font-bold tracking-widest">Target: Pump.fun launches only</div>
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
                 <tr><td colSpan={5} className="py-20 text-center text-xs font-bold text-zinc-700 uppercase tracking-[0.3em] italic">No tokens found under 10m age. Scanning...</td></tr>
              )}
              {tokens.map((t: any, i) => (
                <tr key={i} className="hover:bg-white/[0.03] transition-colors group border-l-2 border-transparent hover:border-orange-500">
                  <td className="px-8 py-6"><TokenAlphaCell mint={t.address} ticker={t.ticker} dexUrl={t.dexUrl} /></td>
                  
                  {/* AGE CELL WITH LIVE NOW ANIMATION */}
                  <td className="px-4 py-6 text-center">
                    <div className="flex flex-col items-center">
                        <span className="bg-orange-500/20 text-orange-500 px-3 py-1 rounded-full text-[11px] font-black border border-orange-500/30 animate-pulse">
                            {t.age}
                        </span>
                        <span className="text-[8px] text-zinc-600 mt-1 uppercase font-bold tracking-widest">Live Now</span>
                    </div>
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
                    <button 
                      onClick={() => executeInstantBuy(t.address, t.ticker)}
                      disabled={buyingStatus === t.ticker}
                      className="inline-flex rounded-xl overflow-hidden border border-white/10 shadow-2xl group/btn hover:scale-[1.02] transition-transform"
                    >
                      <span className="px-4 py-3 text-[11px] font-black uppercase bg-zinc-800 text-zinc-400 group-hover:text-white transition-colors tracking-tighter">
                        {buyingStatus === t.ticker ? '...' : `Score ${t.score}`}
                      </span>
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
        <p className="mt-10 text-center text-[9px] text-zinc-600 font-black uppercase tracking-[0.4em] leading-relaxed">
           Real-Time Analysis Powered by TEFT Legion Core <br/>
           Data: DexScreener L1 Stream | Enrichment: Helius DAS API
        </p>
      </div>
    </main>
  );
}
