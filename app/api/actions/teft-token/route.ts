import { NextRequest } from "next/server";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Content-Encoding, Accept-Encoding",
  "X-Action-Version": "1.0.0",
  "X-Blockchain-Ids": "solana:mainnet-beta",
};

const BASE_URL = "https://teft-supreme-collection.vercel.app";
const INPUT_MINT = "So11111111111111111111111111111111111111112";
const OUTPUT_MINT = "8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump";
const AMOUNT_LAMPORTS = 100000000; // 0.1 SOL

export async function OPTIONS() {
  return new Response(null, { headers });
}

export async function GET() {
  return Response.json(
    {
      title: "Buy TEFT",
      description: "Swap 0.1 SOL → TEFT",
      icon: `${BASE_URL}/teft.png`,
      label: "Buy TEFT",
      links: {
        actions: [
          {
            label: "Buy with 0.1 SOL",
            href: `${BASE_URL}/api/actions/teft-token`,
          },
        ],
      },
    },
    { headers }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const account = body?.account;

    if (!account) {
      return new Response("Missing wallet address", {
        status: 400,
        headers,
      });
    }

    const quoteRes = await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${INPUT_MINT}&outputMint=${OUTPUT_MINT}&amount=${AMOUNT_LAMPORTS}&slippageBps=50`,
      { cache: "no-store" }
    );

    if (!quoteRes.ok) {
      const text = await quoteRes.text();
      console.error("Quote error:", text);
      return new Response("Failed to fetch quote", {
        status: 500,
        headers,
      });
    }

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

    if (!swapRes.ok) {
      const text = await swapRes.text();
      console.error("Swap error:", text);
      return new Response("Failed to create swap transaction", {
        status: 500,
        headers,
      });
    }

    const swapData = await swapRes.json();

    if (!swapData?.swapTransaction) {
      console.error("Missing swapTransaction:", swapData);
      return new Response("No transaction returned", {
        status: 500,
        headers,
      });
    }

    return Response.json(
      {
        transaction: swapData.swapTransaction,
        message: "Swap 0.1 SOL → TEFT",
      },
      { headers }
    );
  } catch (error) {
    console.error("POST error:", error);
    return new Response("Something went wrong", {
      status: 500,
      headers,
    });
  }
}
