"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function Market() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch('/api/nfts').then(res => res.json()).then(setData); }, []);

  return (
    <main className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4 antialiased font-sans">
      <div className="w-full max-w-[400px] bg-[#0f0f0f] rounded-[32px] p-[12px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col text-white">
        <div className="px-5 pt-5 pb-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <Link href="/" className="flex items-center text-zinc-500 text-xs font-bold hover:text-white transition-all">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Link>
            <span className="text-[9px] font-black tracking-widest text-zinc-600 uppercase">Live Market</span>
          </div>
          
          <h2 className="text-[22px] font-bold tracking-tight m-0">NFT Marketplace</h2>
          <p className="text-zinc-500 text-[13px] italic mt-1 mb-6">Verified TEFT Supreme Collection</p>

          <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar snap-x">
            {data?.items?.map((nft: any, i: number) => (
              <div key={i} className="min-w-[240px] bg-white/5 border border-white/10 rounded-[20px] overflow-hidden snap-center">
                <div className="aspect-square w-full overflow-hidden">
                  <img src={nft.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                </div>
                <div className="p-4">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Price</p>
                  <p className="text-lg font-black">{nft.price} SOL</p>
                </div>
              </div>
            ))}
          </div>

          <a href="https://magiceden.io/marketplace/teft_supreme" target="_blank" className="w-full bg-white text-black rounded-[16px] py-4 font-bold flex items-center justify-center gap-2 mt-2 text-[13px]">
            BUY ON MAGIC EDEN <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </main>
  );
}
