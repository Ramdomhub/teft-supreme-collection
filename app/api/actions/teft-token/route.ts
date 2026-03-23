import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    label: "Buy TEFT Token",
    icon: "https://teft-supreme-collection.vercel.app/teft.png",
    description: "Swap SOL → TEFT via Jupiter",
    title: "Buy TEFT",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const account = body.account;

    if (!account) {
      return NextResponse.json(
        { error: "Missing wallet address" },
        { status: 400 }
      );
    }

    // Jupiter quote
    const quoteRes = await fetch(
      "https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump&amount=100000000" // 0.1 SOL
    );

    const quote = await quoteRes.json();

    const swapRes = await fetch("https://quote-api.jup.ag/v6/swap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey: account,
        wrapAndUnwrapSol: true,
      }),
    });

    const swapData = await swapRes.json();

    return NextResponse.json({
      transaction: swapData.swapTransaction,
      message: "Swap 0.1 SOL → TEFT",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// CORS für Blink
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
