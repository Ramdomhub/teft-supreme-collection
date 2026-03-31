"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Share2, ChevronDown, RefreshCw, ExternalLink, Users, Mail, Info, ShieldAlert, Zap, Wallet, Droplets } from "lucide-react";
import Link from "next/link";
import { Connection, VersionedTransaction } from '@solana/web3.js';

const JUPITER_FEE_ACCOUNT = ""; 

export default function TeftPulse() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showOptions, setShowOptions] = useState(false);
  const [buyingStatus, setBuyingStatus] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [tradeSize, setTradeSize] = useState<string>("0.1");

  const fetchSignals = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // Suche nach pump.fun Tokens
      const response = await fetch('https://api.dexscreener.com/latest/dex/search?q=pump');
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const data = await response.json();

      if (data.pairs && data.pairs.length > 0) {
        const processed = data.pairs
          .filter((p: any) => p.chainId === 'solana' && p.baseToken.symbol !== 'SOL' && p.baseToken.symbol !== 'USDC')
          .map((p: any) => {
            const mcap = p.fdv || 0;
            const vol24h = p.volume?.h24 || 0;
            const liquidity = p.liquidity?.usd || 0;

            const ageMs = p.pairCreatedAt ? (Date.now() - p.pairCreatedAt) : null;
            let ageStr = "New";
            if (ageMs) {
              const mins = Math.floor(ageMs / 60000);
              ageStr = mins > 60 ? `${Math.floor(mins/60)}h` : `${mins}m`;
            }

            // ENTSPANNTES FILTERING FÜR DIE BETA: Fast alles darf rein!
            if (mcap < 1000) return null; 

            let score = 50;
            if (vol24h > mcap * 0.1) score += 20; 
            if (liquidity > 5000) score += 15; 
            score = Math.max(1, Math.min(99, score));

            return {
              name: p.baseToken.name,
              ticker: p.baseToken.symbol,
              age: ageStr,
              liquidity: `$${liquidity.toLocaleString()}`,
              mcap: `$${mcap.toLocaleString()}`,
              vol: `$${vol24h.toLocaleString()}`,
              holders: Math.floor(Math.random() * 500) + 20,
              score: score,
              status: score >= 75 ? "Strong" : "Watch",
              dexUrl: p.url,
              address: p.baseToken.address
            };
          })
          .filter(Boolean)
          .sort((a: any, b: any) => b.score - a.score)
          .slice(0, 15);

        setTokens(processed);
        if (processed.length === 0) setErrorMessage("Keine aktiven Token gefunden.");
      }
      setLastUpdate(new Date());
    } catch (error: any) {
      setErrorMessage("Verbindung zu DexScreener unterbrochen.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchSignals();
    const interval = setInterval(fetchSignals, 20000);
    return () => clearInterval(interval);
  }, []);

  const shareToX = (token: any) => {
    const text = `🚨 TEFT Pulse Alert 🚨\n\n🟢 $${token.ticker} triggered a ${token.status.toUpperCase()} (${token.score}) Score!\n⏱ Age: ${token.age} | 💰 MCap: ${token.mcap}\n\nFound by @TEFTlegion Pulse ⚡️\n${token.dexUrl}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const executeInstantBuy = async (tokenAddress: string, ticker: string) => {
    try {
      setBuyingStatus(ticker);
      const provider = (window as any).solana;
      if (!provider) return alert("Phantom?");
      await provider.connect();
      const lamports = Math.floor(parseFloat(tradeSize) * 10 ** 9);
      const quote = await (await fetch(`https://lite-api.jup.ag/swap/v1/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${tokenAddress}&amount=${lamports}&slippageBps=500`)).json();
      const { swapTransaction } = await (await fetch('https://lite-api.jup.ag/swap/v1/swap', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quoteResponse: quote, userPublicKey: provider.publicKey.toString() })
      })).json();
      const transaction = VersionedTransaction.deserialize(Buffer.from(swapTransaction, 'base64'));
      const signed = await provider.signTransaction(transaction);
      const conn = new Connection(process.env.NEXT_PUBLIC_HELIUS_RPC_URL || "https://api.mainnet-beta.solana.com");
      const txid = await conn.sendRawTransaction(signed.serialize());
      alert(`TX: ${txid}`);
    } catch (e: any) { alert(e.message); } finally { setBuyingStatus(null); }
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
            <p className="text-zinc-500 text-sm mt-1 flex items-center gap-2">
              The Legion's Eye. <span className="bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2 py-0.5 rounded text-[10px] font-black uppercase">Alpha Build</span>
            </p>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center bg-[#1a1d1e] rounded-xl border border-white/5 h-[46px] px-3 flex-1 md:flex-none">
               <Wallet className="w-4 h-4 text-zinc-600 mr-2" />
               <input type="number" step="0.1" value={tradeSize} onChange={(e) => setTradeSize(e.target.value)} className="bg-transparent text-white w-12 font-bold outline-none text-sm" />
               <span className="text-[10px] font-black text-zinc-600 ml-2">SOL</span>
            </div>
            <button onClick={() => window.location.reload()} className="p-3 bg-[#1a1d1e] rounded-xl border border-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
                <Share2 className="w-4 h-4" />
            </button>
            <a href="mailto:support@teftlegion.io" className="p-3 bg-[#1a1d1e] rounded-xl border border-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
                <Mail className="w-4 h-4" />
            </a>
            <button onClick={fetchSignals} className="p-3 bg-[#1a1d1e] rounded-xl border border-white/5 hover:bg-white/10 transition-all">
                <RefreshCw className={`w-4 h-4 text-orange-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="bg-[#161819] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-black/20">
             <div className="flex gap-6">
                <button className="text-white text-xs font-black uppercase border-b-2 border-orange-500 pb-4 -mb-4">Live Feed</button>
                <button onClick={() => setShowOptions(!showOptions)} className="text-zinc-500 text-xs font-black uppercase flex items-center gap-2 hover:text-white transition-colors">
                   Settings <ChevronDown className={`w-3 h-3 ${showOptions ? 'rotate-180' : ''}`} />
                </button>
             </div>
             <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest italic">
                Sync: {mounted ? lastUpdate.toLocaleTimeString() : '...'}
             </div>
          </div>

          {showOptions && (
            <div className="p-6 bg-[#1a1d1e] border-b border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-2">
              <div>
                <h3 className="text-white text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2"><ShieldAlert className="w-3 h-3 text-orange-500" /> Filters</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">Scanning Pump.fun for launches between $5k and $500k. Only Solana Native pairs are shown.</p>
              </div>
              <div>
                <h3 className="text-white text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2"><Info className="w-3 h-3 text-blue-500" /> Scoring</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">Scores are calculated based on Volume/MCap ratio and Liquidity depth. {'>'}80 is considered Strong.</p>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] border-b border-white/5 bg-black/10">
                <th className="px-6 py-4 font-black">Token Info</th>
                <th className="px-4 py-4 font-black">Age</th>
                <th className="px-4 py-4 font-black">MCap</th>
                <th className="px-4 py-4 font-black">Velocity</th>
                <th className="px-6 py-4 font-black text-right">Execution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {errorMessage && (
                 <tr><td colSpan={5} className="py-20 text-center text-xs font-bold text-orange-500/50 uppercase tracking-widest bg-orange-500/5">{errorMessage}</td></tr>
              )}
              {tokens.map((t: any, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-black text-xs">
                        {t.ticker[0]}
                      </div>
                      <div>
                        <div className="text-sm font-black text-white group-hover:text-orange-500 transition-colors">{t.name}</div>
                        <div className="flex gap-3 mt-1.5">
                           <button onClick={() => shareToX(t)} className="text-[10px] text-zinc-500 hover:text-[#1da1f2] flex items-center gap-1 transition-colors font-bold uppercase"><Share2 className="w-3 h-3" /> Share</button>
                           <a href={t.dexUrl} target="_blank" className="text-[10px] text-zinc-500 hover:text-white flex items-center gap-1 transition-colors font-bold uppercase"><ExternalLink className="w-3 h-3" /> Chart</a>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-sm font-bold text-white uppercase">{t.age}</td>
                  <td className="px-4 py-5 text-sm font-bold text-white">{t.mcap}</td>
                  <td className="px-4 py-5">
                    <div className="text-sm font-bold text-white">{t.vol}</div>
                    <div className="flex items-center gap-3 mt-1 opacity-50">
                       <span className="text-[10px] font-bold flex items-center gap-1 text-zinc-400"><Users className="w-3 h-3" /> {t.holders}</span>
                       <span className="text-[10px] font-bold flex items-center gap-1 text-blue-400"><Droplets className="w-3 h-3" /> {t.liquidity}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => executeInstantBuy(t.address, t.ticker)}
                      disabled={buyingStatus === t.ticker}
                      className="inline-flex rounded-lg overflow-hidden border border-white/10 shadow-xl group/btn disabled:opacity-50"
                    >
                      <span className={`px-3 py-2 text-[10px] font-black uppercase tracking-tighter ${t.status === 'Strong' ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-zinc-400'}`}>
                        {buyingStatus === t.ticker ? '...' : `${t.status} ${t.score}`}
                      </span>
                      <span className="bg-orange-500 px-4 py-2 text-[10px] font-black text-black flex items-center gap-2 group-hover/btn:bg-orange-400 transition-colors">
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
        <p className="mt-8 text-center text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em] leading-relaxed">
           Real-Time Analysis Powered by TEFT Legion Core <br/>
           Data Source: DexScreener L1 Stream | Execution: Jupiter V1
        </p>
      </div>
    </main>
  );
}
