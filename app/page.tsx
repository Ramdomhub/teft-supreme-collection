"use client";
import Link from "next/link";

export default function Gateway() {
  return (
    <main className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-6 antialiased font-sans">
      <div className="w-[460px] bg-white rounded-[28px] p-[14px] shadow-[0_10px_40px_rgba(0,0,0,0.06)] flex flex-col">
        <div className="rounded-[20px] overflow-hidden aspect-square w-full">
          <img src="/teft.png" alt="TEFT" className="w-full h-full object-cover" />
        </div>
        <div className="px-6 pb-6 pt-8 flex flex-col">
          <h1 className="text-[24px] font-bold tracking-tight text-black m-0 p-0 leading-[1.2]">TEFT Gateway</h1>
          <p className="text-[15px] text-zinc-500 mt-2 mb-6 leading-relaxed">Enter the TEFT ecosystem</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <a href="https://phantom.com/tokens/solana/8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump" target="_blank" className="bg-black text-white py-3.5 rounded-[16px] text-[14px] font-bold text-center hover:opacity-90 transition-all">Open in Phantom</a>
            <Link href="/teft-token" className="bg-[#f3f3f3] text-black py-3.5 rounded-[16px] text-[14px] font-bold text-center hover:bg-zinc-200 transition-all">Explore NFTs</Link>
            <a href="https://www.solsuite.io/teftsupreme" target="_blank" className="bg-[#f3f3f3] text-black py-3.5 rounded-[16px] text-[14px] font-bold text-center">Stake NFTs</a>
            <a href="https://www.teftlegion.io/blank-6" target="_blank" className="bg-[#f3f3f3] text-black py-3.5 rounded-[16px] text-[14px] font-bold text-center">About TEFT</a>
          </div>
          <div className="text-center text-[11px] text-zinc-400 font-black tracking-widest uppercase">Built on Solana</div>
        </div>
      </div>
    </main>
  );
}
