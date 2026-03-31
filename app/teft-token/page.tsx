"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function Market() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch('/api/nfts').then(res => res.json()).then(setData); }, []);

  return (
    <main className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-6 antialiased font-sans">
      {/* Exakt die gleiche Breite und das gleiche Padding wie die weiße Card */}
      <div className="w-[460px] min-h-[600px] bg-[#0f0f0f] rounded-[28px] p-[14px] shadow-[0_20px_50px_rgba(0,0,0,0.25)] flex flex-col text-white overflow-hidden">
        <div className="px-6 pb-8 pt-6 flex flex-col flex-grow">
          <div className="flex justify-between items-center h-[24px] mb-8">
            <Link href="/" className="flex items-center text-zinc-500 text-sm font-bold hover:text-white transition-all">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Link>
            <span className="text-[10px] font-black tracking-widest text-zinc-600 uppercase">Live Market</span>
          </div>
          
          <h2 className="text-[24px] font-black tracking-tighter m-0 p-0 leading-[1.2]">NFT Marketplace</h2>
          <p className="text-zinc-500 text-[13px] italic mt-2 mb-8 leading-relaxed">Verified TEFT Supreme Collection</p>

          <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar snap-x">
            {data?.items?.map((nft: any, i: number) => (
              <div key={i} className="min-w-[280px] bg-white/5 border border-white/10 rounded-[22px] overflow-hidden group snap-center transition-all hover:border-white/20">
                <div className="aspect-square w-full overflow-hidden">
                  <img src={nft.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <div className="p-5">
                  <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Price</p>
                  <p className="text-xl font-black">{nft.price} SOL</p>
                </div>
              </div>
            ))}
          </div>

          <a href="https://magiceden.io/marketplace/teft_supreme" target="_blank" className="w-full bg-white text-black rounded-[16px] py-4 font-black flex items-center justify-center gap-2 mt-auto hover:bg-zinc-200 transition-all text-[14px] shadow-xl">
            BUY ON MAGIC EDEN <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </main>
  );
}
