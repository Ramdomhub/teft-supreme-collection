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
const INPUT_MINT = "So11111111111111111111111111111111111111112"; // SOL
const OUTPUT_MINT = "8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump"; // TEFT

export async function OPTIONS() {
  return new Response(null, { headers });
}

export async function GET() {
  return Response.json(
    {
      title: "Buy TEFT",
      description: "Swap SOL → TEFT via Jupiter",
      icon: `${BASE_URL}/teft.png`,
      label: "Buy TEFT",
      links: {
        actions: [
          {
            label: "Buy 0.01 SOL",
            href: `${BASE_URL}/api/actions/teft-token?amount=0.01`,
          },
          {
            label: "Buy 0.05 SOL",
            href: `${BASE_URL}/api/actions/teft-token?amount=0.05`,
          },
          {
            label: "Buy 0.1 SOL",
            href: `${BASE_URL}/api/actions/teft-token?amount=0.1`,
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

    const url = new URL(req.url);
    const amountParam = url.searchParams.get("amount") || "0.01";
    const amountSol = parseFloat(amountParam);

    if (isNaN(amountSol) || amountSol <= 0) {
      return new Response("Invalid amount", {
        status: 400,
        headers,
      });
    }

    const amountLamports = Math.floor(amountSol * 1e9);

    // Jupiter Ultra Order (funktioniert bei dir bereits)
    const orderUrl =
      `https://lite-api.jup.ag/ultra/v1/order` +
      `?inputMint=${INPUT_MINT}` +
      `&outputMint=${OUTPUT_MINT}` +
      `&amount=${amountLamports}` +
      `&taker=${account}`;

    const orderRes = await fetch(orderUrl, {
      cache: "no-store",
      headers: {
        accept: "application/json",
      },
    });

    const order = await orderRes.json();

    if (!orderRes.ok) {
      return new Response("Failed to fetch quote", {
        status: 500,
        headers,
      });
    }

    if (!order?.transaction) {
      return new Response("No transaction returned", {
        status: 500,
        headers,
      });
    }

    return Response.json(
      {
        transaction: order.transaction,
        message: `Swap ${amountSol} SOL → TEFT`,
      },
      { headers }
    );
  } catch (error) {
    console.error(error);
    return new Response("Something went wrong", {
      status: 500,
      headers,
    });
  }
}
