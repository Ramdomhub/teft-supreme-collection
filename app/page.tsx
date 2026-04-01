"use client";
import React from 'react';
import Link from 'next/link';

export default function Gateway() {
  return (
    <main className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4 antialiased font-sans">
      <div className="w-full max-w-[400px] bg-white rounded-[32px] p-[12px] shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
        {/* Header Image */}
        <div className="rounded-[24px] overflow-hidden aspect-square w-full bg-zinc-100 mb-6">
          <img src="/teft.png" alt="TEFT" className="w-full h-full object-cover" />
        </div>

        {/* Text Content */}
        <div className="px-5 pt-2 pb-6 flex flex-col text-center">
          <h1 className="text-[22px] font-bold tracking-tight text-black m-0 p-0 italic uppercase">TEFT LEGION</h1>
          <p className="text-[14px] text-zinc-500 mt-1 mb-8 font-bold uppercase tracking-widest">Access the TEFT ecosystem</p>

          <div className="grid grid-cols-2 gap-2.5 mb-6">
            {/* PULSE BUTTON - JETZT GESPERRT */}
            <div className="bg-zinc-100 text-zinc-400 py-3.5 rounded-[16px] text-[13px] font-black italic uppercase flex items-center justify-center gap-1 cursor-not-allowed border border-zinc-200">
              Pulse <span className="text-[9px] bg-zinc-200 px-1.5 py-0.5 rounded ml-1 not-italic">SOON</span>
            </div>

            {/* GET NFTS */}
            <Link href="/teft-token" className="bg-[#efefef] text-black py-3.5 rounded-[16px] text-[13px] font-black italic uppercase hover:bg-zinc-200 transition-colors">
              Get NFTs
            </Link>

            {/* SWAP (Externer Link zu Phantom/Jupiter) */}
            <a href="https://phantom.app/tokens/solana/8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump" target="_blank" className="bg-[#efefef] text-black py-3.5 rounded-[16px] text-[13px] font-black italic uppercase hover:bg-zinc-200 transition-colors">
              Swap
            </a>

            {/* STAKING - NOCH SOON */}
            <div className="bg-[#efefef] text-zinc-400 py-3.5 rounded-[16px] text-[13px] font-black italic uppercase cursor-not-allowed">
              Staking
            </div>
          </div>

          {/* Social Links */}
          <div className="flex flex-col items-center gap-1.5 border-t border-zinc-100 pt-6">
            <div className="flex justify-center gap-4 text-[11px] text-zinc-500 font-semibold uppercase tracking-widest">
               <a href="https://x.com/TEFTofficial" target="_blank" className="hover:text-black transition-colors italic">X / Twitter</a>
               <a href="https://t.me/teftlegionofficial" target="_blank" className="hover:text-black transition-colors italic">Telegram</a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
