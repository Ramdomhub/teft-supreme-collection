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
      const response = await fetch('https://api.dexscreener.com/latest/dex/search?q=sol');
      
      if (!response.ok) {
         throw new Error(`HTTP Error: ${response.status} - DexScreener blockiert uns.`);
      }

      const data = await response.json();

      if (data.pairs && data.pairs.length > 0) {
        const processed = data.pairs
          .filter((p: any) => p.chainId === 'solana')
          .map((p: any) => {
            const mcap = p.fdv || 0;
            const vol24h = p.volume?.h24 || 0;
            const liquidity = p.liquidity?.usd || 0;

            let score = 50;
            if (vol24h > mcap * 0.2) score += 20; 
            if (liquidity > mcap * 0.1) score += 15; 
            score = Math.max(1, Math.min(99, score));

            return {
              name: p.baseToken.name,
              ticker: p.baseToken.symbol,
              liquidity: `$${liquidity.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
              mcap: `$${mcap.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
              vol: `$${vol24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
              score: score,
              status: score >= 80 ? "Strong" : "Watch",
              dexUrl: p.url,
              address: p.baseToken.address
            };
          })
          .sort((a: any, b: any) => b.score - a.score)
          .slice(0, 15);

        setTokens(processed);
      } else {
        setErrorMessage("DexScreener hat geantwortet, aber 0 Token gefunden.");
      }
      setLastUpdate(new Date());
    } catch (error: any) {
      console.error("DexScreener Fetch Error:", error);
      setErrorMessage(error.message || "Unbekannter Netzwerkfehler (Wahrscheinlich CORS)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchSignals();
  }, []);

  const shareToX = (token: any) => {
    const text = `🚨 TEFT Pulse Alert 🚨\n\n🟢 $${token.ticker} triggered a ${token.status.toUpperCase()} (${token.score}) Score!\n💧 Liq: ${token.liquidity} | 💰 MCap: ${token.mcap} | 🌊 Vol: ${token.vol}\n\nFound by @TEFTlegion Pulse ⚡️\n${token.dexUrl}`;
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
      if (JUPITER_FEE_ACCOUNT) quoteUrl += `&platformFeeBps=50`; 

      const quoteResponse = await (await fetch(quoteUrl)).json();
      if (quoteResponse.error) throw new Error(quoteResponse.error);

      const swapBody: any = { quoteResponse, userPublicKey: pubKey, wrapAndUnwrapSol: true };
      if (JUPITER_FEE_ACCOUNT) swapBody.feeAccount = JUPITER_FEE_ACCOUNT;

      const swapResponse = await (await fetch('https://lite-api.jup.ag/swap/v1/swap', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(swapBody)
      })).json();

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
        <div className="absolute top-6 left-6 z-20">
           <Link href="/" className="bg-black/40 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-xl text-white font-bold hover:bg-white/10 transition-all uppercase tracking-widest text-[10px] md:text-sm flex items-center gap-2">
              <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" /> Gateway
           </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 -mt-10 md:-mt-16 relative z-10 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-8 gap-6 md:gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">TEFT Pulse</h1>
            <p className="text-zinc-500 text-sm md:text-lg mt-1 font-medium flex items-center">
              See what others don't. <span className="text-[10px] bg-orange-500/20 text-orange-500 border border-orange-500/30 px-2 py-0.5 rounded tracking-widest uppercase ml-3">Beta</span>
            </p>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
            <div className="flex items-center bg-[#1a1d1e] rounded-xl border border-white/5 overflow-hidden h-[42px] flex-1 md:flex-none">
               <div className="pl-3 pr-2 flex items-center text-zinc-500"><Wallet className="w-4 h-4" /></div>
               <input type="number" step="0.01" min="0.01" value={tradeSize} onChange={(e) => setTradeSize(e.target.value)} className="bg-transparent text-white w-full md:w-16 text-sm font-bold outline-none placeholder:text-zinc-700" placeholder="0.1" />
               <div className="pr-4 text-xs font-bold text-zinc-600 uppercase tracking-widest">SOL</div>
            </div>
            <button onClick={fetchSignals} className="p-3 bg-[#1a1d1e] rounded-xl border border-white/5 hover:bg-white/5 transition-all shrink-0">
                <RefreshCw className={`w-4 h-4 text-white ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="bg-[#161819] rounded-2xl border border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="flex justify-between items-center px-4 md:px-6 py-4 border-b border-white/5">
             <div className="flex gap-4 text-[12px] md:text-[13px] font-bold uppercase tracking-wider items-center">
                <span className="text-white border-b border-orange-500 pb-4 -mb-4 px-2">Feed</span>
             </div>
             <div className="text-[9px] md:text-[11px] text-zinc-600 font-bold uppercase tracking-widest">
                Updated {mounted ? lastUpdate.toLocaleTimeString() : '...'}
             </div>
          </div>

          <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[650px]">
            <thead>
              <tr className="text-[10px] md:text-[11px] text-zinc-600 uppercase tracking-widest border-b border-white/5">
                <th className="px-4 md:px-6 py-5 font-bold">Token</th>
                <th className="px-4 py-5 font-bold">Real MCap</th>
                <th className="px-4 py-5 font-bold">Real Vol</th>
                <th className="px-4 md:px-6 py-5 font-bold text-right">Instant Buy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              
              {errorMessage && (
                 <tr><td colSpan={4} className="text-center py-10 bg-red-500/10 text-red-400 font-bold border border-red-500/20 m-4 rounded">🚨 FEHLER: {errorMessage}</td></tr>
              )}

              {tokens.length === 0 && !loading && !errorMessage && (
                 <tr><td colSpan={4} className="text-center py-10 text-zinc-600">Waiting for perfect signals...</td></tr>
              )}

              {tokens.map((t: any, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-all group">
                   <td className="px-4 md:px-6 py-4 md:py-5 text-white">{t.name} ({t.ticker})</td>
                   <td className="px-4 py-4 md:py-5 text-white">{t.mcap}</td>
                   <td className="px-4 py-4 md:py-5 text-white">{t.vol}</td>
                   <td className="px-4 py-4 md:py-5 text-white text-right"><button onClick={() => executeInstantBuy(t.address, t.ticker)} className="bg-orange-500 text-black px-3 py-1 rounded font-bold text-xs">BUY</button></td>
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
