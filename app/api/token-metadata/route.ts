import { NextResponse } from "next/server";

type HeliusAssetResponse = {
  result?: {
    content?: {
      metadata?: {
        name?: string;
        image?: string;
      };
      links?: {
        image?: string;
      };
    };
  };
  error?: {
    message?: string;
  };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mint = searchParams.get("mint");

  if (!mint) {
    return NextResponse.json({ error: "No mint" }, { status: 400 });
  }

  const rpcUrl = process.env.HELIUS_RPC_URL;
  if (!rpcUrl) {
    return NextResponse.json(
      { error: "Missing HELIUS_RPC_URL" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "teft-pulse",
        method: "getAsset",
        params: {
          id: mint,
          displayOptions: { showFungible: true },
        },
      }),
    });

    const data = (await response.json()) as HeliusAssetResponse;

    if (!response.ok || data.error) {
      console.error("Helius error:", data);
      return NextResponse.json(
        { error: "Failed to fetch token metadata" },
        { status: 502 }
      );
    }

    const result = data.result;

    return NextResponse.json({
      name: result?.content?.metadata?.name || null,
      image:
        result?.content?.links?.image ||
        result?.content?.metadata?.image ||
        null,
    });
  } catch (error) {
    console.error("Helius request failed:", error);
    return NextResponse.json({ error: "Helius Error" }, { status: 500 });
  }
}
