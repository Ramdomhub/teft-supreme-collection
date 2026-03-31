"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Share2, ChevronDown, RefreshCw, ExternalLink, Users, Mail, Info, ShieldAlert, Zap, Wallet } from "lucide-react";
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
  
  const [tradeSize, setTradeSize] = useState<string>("0.1");

  const fetchSignals = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/signals');
      const data = await response.json();
      if (data.signals) setTokens(data.signals);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Fehler beim Laden der Signale", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchSignals();
    const interval = setInterval(fetchSignals, 15000);
    return () => clearInterval(interval);
  }, []);

  const shareToX = (token: any) => {
    const text = `🚨 TEFT Pulse Alert 🚨\n\n🟢 $${token.ticker} triggered a ${token.status.toUpperCase()} (${token.score}) Score!\n⏱ Age: ${token.age} | 💰 MCap: ${token.mcap} | 🌊 Vol: ${token.vol}\n\nFound by @TEFTlegion Pulse ⚡️\n${token.dexUrl}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const executeInstantBuy = async (tokenAddress: string, ticker: string) => {
    try {
      setBuyingStatus(ticker);
      
      const provider = (window as any).solana;
      if (!provider || !provider.isPhantom) {
        alert("Phantom Wallet nicht gefunden! Bitte installieren.");
        setBuyingStatus(null);
        return;
      }
      await provider.connect();
      const pubKey = provider.publicKey.toString();

      const lamports = Math.floor(parseFloat(tradeSize) * 10 ** 9);
      if (isNaN(lamports) || lamports <= 0) throw new Error("Ungültige Trade-Größe");

      let quoteUrl = `https://lite-api.jup.ag/swap/v1/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${tokenAddress}&amount=${lamports}&slippageBps=500`;
      if (JUPITER_FEE_ACCOUNT) {
        quoteUrl += `&platformFeeBps=50`; 
      }

      const quoteResponse = await (await fetch(quoteUrl)).json();
      if (quoteResponse.error) throw new Error(quoteResponse.error);

      const swapBody: any = {
        quoteResponse,
        userPublicKey: pubKey,
        wrapAndUnwrapSol: true,
      };
      if (JUPITER_FEE_ACCOUNT) {
        swapBody.feeAccount = JUPITER_FEE_ACCOUNT;
      }

      const swapResponse = await (
        await fetch('https://lite-api.jup.ag/swap/v1/swap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(swapBody)
        })
      ).json();

      if (swapResponse.error) throw new Error(swapResponse.error);

      const swapTransactionBuf = Buffer.from(swapResponse.swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
      const signedTransaction = await provider.signTransaction(transaction);

      const rpcUrl = process.env.NEXT_PUBLIC_HELIUS_RPC_URL || "https://api.mainnet-beta.solana.com";
      const connection = new Connection(rpcUrl, 'confirmed');
      const rawTransaction = signedTransaction.serialize();
      
      const txid = await connection.sendRawTransaction(rawTransaction, { skipPreflight: true, maxRetries: 2 });
      alert(`🚀 Swap an Solana gesendet! TX: ${txid}`);
      
    } catch (error: any) {
      console.error("Swap fehlgeschlagen:", error);
      alert(`Swap abgebrochen: ${error.message}`);
    } finally {
      setBuyingStatus(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f1112] text-[#9ca3af] font-sans antialiased selection:bg-orange-500/30">
      <div className="relative w-full h-[250px] md:h-[350px] overflow-hidden">
        <img src="/teft.png" className="w-full h-full object-cover opacity-30 grayscale-[0.8] contrast-[1.2]" alt="TEFT Background" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1112] via-[#0f1112]/50 to-transparent" />
        
        {/* MOBILE FIX 1: Gateway Button nach oben verlegt */}
        <div className="absolute top-6 left-6 z-20">
           <Link href="/" className="bg-black/40 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-xl text-white font-bold hover:bg-white/10 transition-all uppercase tracking-widest text-[10px] md:text-sm flex items-center gap-2">
              <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" /> Gateway
           </Link>
        </div>
      </div>

      {/* MOBILE FIX 2: Abstand nach oben optimiert */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 -mt-10 md:-mt-16 relative z-10 pb-20">
        
        {/* MOBILE FIX 3: Flex-Column auf dem Handy, Row auf dem Desktop */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-8 gap-6 md:gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">TEFT Pulse</h1>
            <p className="text-zinc-500 text-sm md:text-lg mt-1 font-medium flex items-center">
              See what others don't. 
              <span className="text-[10px] bg-orange-500/20 text-orange-500 border border-orange-500/30 px-2 py-0.5 rounded tracking-widest uppercase ml-3">Beta</span>
            </p>
          </div>
          
          {/* Controls-Container nimmt auf Mobile volle Breite ein */}
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
            <div className="flex items-center bg-[#1a1d1e] rounded-xl border border-white/5 overflow-hidden h-[42px] flex-1 md:flex-none">
               <div className="pl-3 pr-2 flex items-center text-zinc-500">
                  <Wallet className="w-4 h-4" />
               </div>
               <input 
                  type="number" 
                  step="0.01" 
                  min="0.01"
                  value={tradeSize}
                  onChange={(e) => setTradeSize(e.target.value)}
                  className="bg-transparent text-white w-full md:w-16 text-sm font-bold outline-none placeholder:text-zinc-700"
                  placeholder="0.1"
               />
               <div className="pr-4 text-xs font-bold text-zinc-600 uppercase tracking-widest">SOL</div>
            </div>
            
            <a href="mailto:support@teftlegion.io" className="p-3 bg-[#1a1d1e] rounded-xl border border-white/5 hover:bg-white/5 transition-all group shrink-0" title="Feedback">
                <Mail className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            </a>
            <button onClick={fetchSignals} className="p-3 bg-[#1a1d1e] rounded-xl border border-white/5 hover:bg-white/5 transition-all shrink-0">
                <RefreshCw className={`w-4 h-4 text-white ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="bg-[#161819] rounded-2xl border border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden">
          
          <div className="flex justify-between items-center px-4 md:px-6 py-4 border-b border-white/5">
             <div className="flex gap-4 text-[12px] md:text-[13px] font-bold uppercase tracking-wider items-center">
                <span className="text-white border-b border-orange-500 pb-4 -mb-4 px-2">Feed</span>
                <button 
                  onClick={() => setShowOptions(!showOptions)} 
                  className={`px-3 md:px-4 py-1.5 transition-all flex items-center gap-2 ${showOptions ? 'bg-[#2a2d2e] text-white rounded-lg' : 'text-zinc-500 hover:text-white'}`}
                >
                  Options <ChevronDown className={`w-3 h-3 transition-transform ${showOptions ? 'rotate-180' : ''}`} />
                </button>
             </div>
             <div className="text-[9px] md:text-[11px] text-zinc-600 font-bold uppercase tracking-widest">
                Updated {mounted ? lastUpdate.toLocaleTimeString() : '...'}
             </div>
          </div>

          {showOptions && (
            <div className="p-4 md:p-6 bg-[#1a1d1e] border-b border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldAlert className="w-4 h-4 text-zinc-400" />
                    <h3 className="text-white font-bold text-sm tracking-widest uppercase">Hard Filters (The Gate)</h3>
                  </div>
                  <ul className="space-y-2 text-xs md:text-sm text-zinc-400">
                    <li className="flex items-center gap-2">✓ <span className="text-zinc-200 font-medium">Network:</span> Strictly Solana Native</li>
                    <li className="flex items-center gap-2">✓ <span className="text-zinc-200 font-medium">Age:</span> Max 10 min alt</li>
                    <li className="flex items-center gap-2">✓ <span className="text-zinc-200 font-medium">MCap:</span> Hard filter $7k - $20k</li>
                    <li className="flex items-center gap-2">✓ <span className="text-zinc-200 font-medium">Volume:</span> Action over $5k required</li>
                    <li className="flex items-center gap-2">✓ <span className="text-zinc-200 font-medium">Security:</span> <span className="text-orange-400">Helius On-Chain Verification</span></li>
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-4 h-4 text-orange-500" />
                    <h3 className="text-white font-bold text-sm tracking-widest uppercase">Pulse Engine Scoring</h3>
                  </div>
                  <ul className="space-y-2 text-xs md:text-sm text-zinc-400">
                    <li className="flex items-center gap-2"><span className="text-orange-500 font-black">+</span> <span className="text-zinc-200 font-medium">LP Burn:</span> Burned liquidity boosts score</li>
                    <li className="flex items-center gap-2"><span className="text-orange-500 font-black">+</span> <span className="text-zinc-200 font-medium">Whale Check:</span> Top 10 holders under 30%</li>
                    <li className="flex items-center gap-2"><span className="text-red-500 font-black">-</span> <span className="text-zinc-200 font-medium">Dump Risk:</span> Top 10 holders over 50%</li>
                    <li className="flex items-center gap-2"><span className="text-orange-500 font-black">+</span> <span className="text-zinc-200 font-medium">Velocity:</span> High Volume to MCap ratio</li>
                    <li className="flex items-center gap-2">👥 <span className="text-zinc-200 font-medium">Holders:</span> Tracked automatically</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[650px]">
            <thead>
              <tr className="text-[10px] md:text-[11px] text-zinc-600 uppercase tracking-widest border-b border-white/5">
                <th className="px-4 md:px-6 py-5 font-bold">Token</th>
                <th className="px-4 py-5 font-bold">Age</th>
                <th className="px-4 py-5 font-bold">MCap</th>
                <th className="px-4 py-5 font-bold">Volume</th>
                <th className="px-4 md:px-6 py-5 font-bold text-right">Instant Buy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tokens.length === 0 && !loading && (
                 <tr><td colSpan={5} className="text-center py-10 text-zinc-600">No signals found matching the TEFT-Filter right now.</td></tr>
              )}
              {tokens.map((t: any, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-all group">
                  <td className="px-4 md:px-6 py-4 md:py-5">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        <div className="text-white font-bold text-[10px] md:text-xs uppercase tracking-tighter">{t.ticker[0]}</div>
                      </div>
                      <div>
                        <div className="text-[13px] md:text-[15px] font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1">{t.name} <span className="text-[9px] md:text-[10px] text-zinc-600 ml-1 uppercase">{t.ticker}</span></div>
                        <div className="flex gap-2 mt-1">
                           <button onClick={() => shareToX(t)} className="w-4 h-4 bg-[#1da1f2]/10 hover:bg-[#1da1f2]/20 text-[#1da1f2] rounded flex items-center justify-center transition-all" title="Share Alpha on X">𝕏</button>
                           <a href={t.dexUrl} target="_blank" className="w-4 h-4 bg-zinc-800 hover:bg-zinc-700 rounded flex items-center justify-center text-white transition-all" title="View Chart"><ExternalLink className="w-2.5 h-2.5" /></a>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 md:py-5 text-[12px] md:text-[14px] font-bold text-white">{t.age}</td>
                  <td className="px-4 py-4 md:py-5 text-[12px] md:text-[14px] font-bold text-white">{t.mcap}</td>
                  <td className="px-4 py-4 md:py-5">
                    <div className="text-[12px] md:text-[14px] font-bold text-white">{t.vol}</div>
                    <div className="text-[9px] md:text-[10px] text-zinc-600 font-bold flex items-center gap-1 mt-0.5">
                      <Users className="w-3 h-3" /> {t.holders}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 md:py-5 text-right">
                    <button 
                      onClick={() => executeInstantBuy(t.address, t.ticker)}
                      disabled={buyingStatus === t.ticker}
                      className="inline-flex rounded-lg overflow-hidden border border-white/5 shadow-lg hover:border-orange-500 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all cursor-pointer group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className={`px-2 md:px-3 py-1.5 text-[10px] md:text-[11px] font-black uppercase tracking-tighter ${t.status === 'Strong' ? 'bg-[#1a2e26] text-[#4ade80]' : 'bg-[#2e2a1a] text-[#facc15]'}`}>
                        {buyingStatus === t.ticker ? 'Load...' : t.status}
                      </span>
                      <span className="bg-orange-500 px-2 md:px-3 py-1.5 text-[10px] md:text-[11px] font-black text-black border-l border-white/5 flex items-center gap-1 group-hover/btn:bg-orange-400 transition-colors">
                        <Zap className="w-3 h-3" /> BUY
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          <div className="p-6 md:p-8 text-center border-t border-white/5 bg-[#121415]">
            <p className="text-[9px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
              Many of these will fail. Don't trust – verify.<br className="md:hidden" /> High-speed execution powered by Jupiter API.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
