import { NextRequest } from "next/server";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Content-Encoding, Accept-Encoding",
  "X-Action-Version": "1.0.0",
  "X-Blockchain-Ids": "solana:mainnet-beta",
};

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://teft-supreme-collection.vercel.app";

const MAGIC_EDEN_API_BASE = "https://api-mainnet.magiceden.dev/v2";
const MINT = "FBduFJSWcfExLLDyxzeiaB64Dh85KDKiFbN6DXsH6xzz";
const FALLBACK_IMAGE = `${BASE_URL}/teft.png`;

type Listing = {
  price?: number;
  seller?: string;
  auctionHouse?: string;
  tokenAddress?: string; // Magic Eden listings often expose the token account here
  tokenATA?: string; // fallback if response uses this name
};

type TokenMeta = {
  name?: string;
  image?: string;
};

function getMagicEdenApiKey() {
  const apiKey = process.env.MAGIC_EDEN_API_KEY;
  if (!apiKey) {
    throw new Error("Missing MAGIC_EDEN_API_KEY");
  }
  return apiKey;
}

function jsonError(message: string, status = 500) {
  return new Response(message, { status, headers });
}

export async function OPTIONS() {
  return new Response(null, { headers });
}

async function getCurrentListing(): Promise<Listing | undefined> {
  const listingRes = await fetch(
    `${MAGIC_EDEN_API_BASE}/tokens/${MINT}/listings`,
    {
      headers: { accept: "application/json" },
      cache: "no-store",
    }
  );

  if (!listingRes.ok) {
    throw new Error(`Listings fetch failed: ${listingRes.status}`);
  }

  const listings = (await listingRes.json()) as Listing[];
  return Array.isArray(listings) ? listings[0] : undefined;
}

async function getTokenMeta(): Promise<TokenMeta> {
  const metaRes = await fetch(`${MAGIC_EDEN_API_BASE}/tokens/${MINT}`, {
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  if (!metaRes.ok) {
    throw new Error(`Metadata fetch failed: ${metaRes.status}`);
  }

  return (await metaRes.json()) as TokenMeta;
}

export async function GET() {
  try {
    const [listing, meta] = await Promise.all([getCurrentListing(), getTokenMeta()]);

    const price = listing?.price;
    const name = meta?.name || "TEFT Supreme";
    const image = meta?.image || FALLBACK_IMAGE;
    const hasPrice = typeof price === "number";

    return Response.json(
      {
        title: name,
        description: hasPrice
          ? `Buy now for ${price} SOL`
          : "Currently not listed",
        icon: image,
        label: hasPrice ? `Buy for ${price} SOL` : "Unavailable",
        disabled: !hasPrice,
        links: hasPrice
          ? {
              actions: [
                {
                  label: `Buy for ${price} SOL`,
                  href: `${BASE_URL}/api/actions/teft`,
                },
              ],
            }
          : undefined,
        extras: {
          mint: MINT,
          price: hasPrice ? price : null,
          seller: listing?.seller ?? null,
        },
      },
      { headers }
    );
  } catch (error) {
    console.error("GET action error:", error);

    return Response.json(
      {
        title: "TEFT Supreme",
        description: "NFT data currently unavailable",
        icon: FALLBACK_IMAGE,
        label: "Unavailable",
        disabled: true,
      },
      { headers }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const buyer = body?.account;

    if (!buyer) {
      return jsonError("Missing wallet", 400);
    }

    const listing = await getCurrentListing();

    if (!listing) {
      return jsonError("No listing found", 400);
    }

    if (
      typeof listing.price !== "number" ||
      !listing.seller ||
      !listing.auctionHouse
    ) {
      return jsonError("Incomplete listing data", 400);
    }

    const tokenATA = listing.tokenAddress || listing.tokenATA;
    if (!tokenATA) {
      return jsonError("Missing token account for listing", 502);
    }

    const apiKey = getMagicEdenApiKey();

    const params = new URLSearchParams({
      buyer,
      seller: listing.seller,
      auctionHouseAddress: listing.auctionHouse,
      tokenMint: MINT,
      tokenATA,
      price: String(listing.price),
    });

    const buyRes = await fetch(
      `${MAGIC_EDEN_API_BASE}/instructions/buy_now?${params.toString()}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        cache: "no-store",
      }
    );

    if (!buyRes.ok) {
      const text = await buyRes.text();
      console.error("Buy instruction failed:", text);
      return jsonError("Failed to create buy transaction", 500);
    }

    const data = await buyRes.json();
    const transaction = data?.tx || data?.transaction;

    if (!transaction) {
      console.error("Unexpected buy response:", data);
      return jsonError("Missing transaction in response", 500);
    }

    return Response.json(
      {
        transaction,
        message: `Buy TEFT NFT for ${listing.price} SOL`,
      },
      { headers }
    );
  } catch (error) {
    console.error("POST action error:", error);
    return jsonError("Error", 500);
  }
}
