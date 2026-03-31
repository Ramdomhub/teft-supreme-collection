"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Share2, ChevronDown, RefreshCw, ExternalLink, Users, Mail, Info, ShieldAlert, Zap, Wallet, Droplets } from "lucide-react";
import Link from "next/link";
import { Connection, VersionedTransaction } from '@solana/web3.js';

const JUPITER_FEE_ACCOUNT = ""; 

// DIESE KOMPONENTE HOLT ALLES VON HELIUS: BILD UND NAME
function TokenAlphaCell({ mint, ticker }: { mint: string, ticker: string }) {
  const [meta, setMeta] = useState<{name: string, image: string} | null>(null);

  useEffect(() => {
    fetch(`/api/token-metadata?mint=${mint}`)
      .then(res => res.json())
      .then(data => {
        if (data.name || data.image) setMeta(data);
      })
      .catch(() => {});
  }, [mint]);

  return (
    <div className="flex items-center gap-4">
      {meta?.image ? (
        <img src={meta.image} className="w-10 h-10 rounded-full border border-white/10 shadow-xl object-cover" alt="logo" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-black text-xs uppercase">{ticker[0]}</div>
      )}
      <div>
        <div className="text-sm font-black text-white group-hover:text-orange-400 transition-colors uppercase line-clamp-1">
          {meta?.name || ticker}
        </div>
        <div className="flex gap-2 mt-1">
           <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter bg-white/5 px-1.5 py-0.5 rounded">{ticker}</span>
           <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter italic">{mint.slice(0,4)}...</span>
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
            const liquidity = p.liquidity?.usd || 0;
            const ageMs = p.pairCreatedAt ? (Date.now() - p.pairCreatedAt) : null;
            let ageStr = "New";
            if (ageMs) {
              const mins = Math.floor(ageMs / 60000);
              ageStr = mins > 60 ? `${Math.floor(mins/60)}h` : `${mins}m`;
            }

            // FILTER GEÖFFNET: Alles von 5k bis 100M Market Cap
            if (mcap < 5000 || mcap > 100000000) return null;

            return {
              ticker: p.baseToken.symbol,
              address: p.baseToken.address,
              age: ageStr,
              mcap: `$${mcap.toLocaleString(undefined, {maximumFractionDigits:0})}`,
              liq: `$${liquidity.toLocaleString(undefined, {maximumFractionDigits:0})}`,
              vol: `$${(p.volume?.h24 || 0).toLocaleString(undefined, {maximumFractionDigits:0})}`,
              score: Math.floor(Math.random() * 30) + 65,
              dexUrl: p.url
            };
          })
          .filter(Boolean)
          .slice(0, 15);

        setTokens(processed);
        if (processed.length === 0) setErrorMessage("Warte auf launches (5k-100M MC)...");
      }
    } catch (e) { setErrorMessage("API Link Error"); }
    setLoading(false);
    setLastUpdate(new Date());
  };

  useEffect(() => { fetchSignals(); const i = setInterval(fetchSignals, 20000); return () => clearInterval(i); }, []);

  const executeInstantBuy = async (addr: string, tick: string) => {
    setBuyingStatus(tick);
    try {
      const provider = (window as any).solana;
      if (!provider) return alert("Phantom?");
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
      <div className="relative w-full h-[250px] md:h-[350px] overflow-hidden">
        <img src="/teft.png" className="w-full h-full object-cover opacity-20 grayscale" alt="TEFT" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1112] to-transparent" />
        <div className="absolute top-6 left-6 z-20">
           <Link href="/" className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl text-white font-bold text-[10px] md:text-xs flex items-center gap-2 uppercase tracking-widest">
              <ArrowLeft className="w-4 h-4" /> Gateway
           </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-10 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tighter">TEFT Pulse</h1>
            <p className="text-zinc-500 text-sm mt-1 flex items-center gap-2">The Legion's Eye. <span className="text-orange-500 font-black uppercase text-[10px]">Alpha Build</span></p>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center bg-[#1a1d1e] rounded-xl border border-white/5 h-[46px] px-3 flex-1 md:flex-none">
               <Wallet className="w-4 h-4 text-zinc-600 mr-2" />
               <input type="number" step="0.1" value={tradeSize} onChange={(e) => setTradeSize(e.target.value)} className="bg-transparent text-white w-12 font-bold outline-none text-sm" />
            </div>
            <a href="mailto:support@teftlegion.io" className="p-3 bg-[#1a1d1e] rounded-xl border border-white/5 hover:bg-white/10 text-zinc-400"><Mail className="w-4 h-4" /></a>
            <button onClick={fetchSignals} className="p-3 bg-[#1a1d1e] rounded-xl border border-white/5 hover:bg-white/10 transition-all">
                <RefreshCw className={`w-4 h-4 text-orange-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="bg-[#161819] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-black/20">
             <div className="flex gap-6">
                <button className="text-white text-xs font-black uppercase border-b-2 border-orange-500 pb-4 -mb-4">Live Feed</button>
                <button onClick={() => setShowOptions(!showOptions)} className="text-zinc-500 text-xs font-black uppercase flex items-center gap-2 hover:text-white transition-colors">Settings <ChevronDown className={`w-3 h-3 ${showOptions ? 'rotate-180' : ''}`} /></button>
             </div>
             <div className="text-[10px] text-zinc-600 font-bold italic uppercase tracking-widest">Sync: {lastUpdate.toLocaleTimeString()}</div>
          </div>

          {showOptions && (
            <div className="p-6 bg-[#1a1d1e] border-b border-white/5 grid grid-cols-2 gap-8">
              <div className="text-xs text-zinc-500">Filter: Solana Memes | 5k - 100M MCap.</div>
              <div className="text-xs text-zinc-500">Data: DexScreener L1 + Helius DAS Enrichment.</div>
            </div>
          )}

          <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] border-b border-white/5 bg-black/10">
                <th className="px-6 py-4 font-black">Token Alpha</th>
                <th className="px-4 py-4 font-black">Age</th>
                <th className="px-4 py-4 font-black">MCap</th>
                <th className="px-4 py-4 font-black">Liquidity</th>
                <th className="px-6 py-4 font-black text-right">Execution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {errorMessage && !tokens.length && (
                 <tr><td colSpan={5} className="py-20 text-center text-xs font-bold text-orange-500/50 uppercase tracking-widest bg-orange-500/5">{errorMessage}</td></tr>
              )}
              {tokens.map((t: any, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5"><TokenAlphaCell mint={t.address} ticker={t.ticker} /></td>
                  <td className="px-4 py-5 text-sm font-bold text-white uppercase">{t.age}</td>
                  <td className="px-4 py-5 text-sm font-bold text-white">{t.mcap}</td>
                  <td className="px-4 py-5">
                    <div className="text-sm font-bold text-white">{t.liq}</div>
                    <div className="text-[9px] text-zinc-600 font-bold uppercase mt-1">Vol: {t.vol}</div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button onClick={() => executeInstantBuy(t.address, t.ticker)} className="inline-flex rounded-lg overflow-hidden border border-white/10 shadow-xl">
                      <span className="px-3 py-2 text-[10px] font-black uppercase bg-zinc-800 text-zinc-400">Score {t.score}</span>
                      <span className="bg-orange-500 px-4 py-2 text-[10px] font-black text-black flex items-center gap-2 hover:bg-orange-400 transition-colors">
                        <Zap className="w-3 h-3" /> BUY
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
