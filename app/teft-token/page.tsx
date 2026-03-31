"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function Market() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch('/api/nfts').then(res => res.json()).then(setData); }, []);

  return (
    <main className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4 antialiased font-sans">
      {/* EXAKT GLEICHE MAẞE WIE DIE STARTSEITE (400px breit, weißer Hintergrund) */}
      <div className="w-full max-w-[400px] bg-white rounded-[32px] p-[12px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col">
        
        <div className="px-5 pt-5 pb-6 flex flex-col">
          {/* HEADER MIT BACK-BUTTON */}
          <div className="flex justify-between items-center mb-6">
            <Link href="/" className="flex items-center text-zinc-400 text-xs font-bold hover:text-black transition-all">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Link>
            <span className="text-[9px] font-black tracking-widest text-zinc-300 uppercase">Live Market</span>
          </div>
          
          <h2 className="text-[22px] font-bold tracking-tight text-black m-0">NFT Marketplace</h2>
          <p className="text-zinc-500 text-[14px] mt-1 mb-6">Verified TEFT Supreme Collection</p>

          {/* NFT KARUSSELL (Helles Design) */}
          <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar snap-x">
            {data?.items?.map((nft: any, i: number) => (
              <div key={i} className="min-w-[240px] bg-[#f9f9f9] border border-zinc-100 rounded-[20px] overflow-hidden snap-center">
                <div className="aspect-square w-full overflow-hidden bg-zinc-100">
                  <img src={nft.image} className="w-full h-full object-cover transition-transform hover:scale-110 duration-700" />
                </div>
                <div className="p-4">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Price</p>
                  <p className="text-[18px] font-bold text-black">{nft.price} SOL</p>
                </div>
              </div>
            ))}
          </div>

          {/* MAGIC EDEN BUTTON (Schwarz wie auf Startseite) */}
          <a 
            href="https://magiceden.io/marketplace/teft_supreme" 
            target="_blank" 
            className="w-full bg-black text-white rounded-[16px] py-4 font-bold flex items-center justify-center gap-2 mt-2 text-[13px] hover:opacity-90 transition-all shadow-lg"
          >
            BUY ON MAGIC EDEN <ExternalLink className="w-4 h-4" />
          </a>

          {/* FOOTER-INFO FÜR DIE SYMMETRIE */}
          <div className="mt-6 text-center text-[10px] text-zinc-300 font-medium uppercase tracking-widest">
            Solana Blockchain
          </div>
        </div>
      </div>
    </main>
  );
}
