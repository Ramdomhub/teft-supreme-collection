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
const MINT = "FBduFJSWcfExLLDyxzeiaB64Dh85KDKiFbN6DXsH6xzz";
const FALLBACK_IMAGE = `${BASE_URL}/teft.png`;

type Listing = {
  price?: number;
  seller?: string;
  auctionHouse?: string;
};

type TokenMeta = {
  name?: string;
  image?: string;
};

export async function OPTIONS() {
  return new Response(null, { headers });
}

export async function GET() {
  try {
    // 1) Aktuelles Listing holen (öffentlich)
    const listingRes = await fetch(
      `https://api-mainnet.magiceden.dev/v2/tokens/${MINT}/listings`,
      {
        headers: {
          accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!listingRes.ok) {
      throw new Error(`Listings fetch failed: ${listingRes.status}`);
    }

    const listings = (await listingRes.json()) as Listing[];
    const listing = Array.isArray(listings) ? listings[0] : undefined;
    const price = listing?.price;

    // 2) NFT-Metadaten holen (öffentlich)
    const metaRes = await fetch(
      `https://api-mainnet.magiceden.dev/v2/tokens/${MINT}`,
      {
        headers: {
          accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!metaRes.ok) {
      throw new Error(`Metadata fetch failed: ${metaRes.status}`);
    }

    const meta = (await metaRes.json()) as TokenMeta;

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
      return new Response("Missing wallet", { status: 400, headers });
    }

    // 1) Aktuelles Listing holen
    const listingRes = await fetch(
      `https://api-mainnet.magiceden.dev/v2/tokens/${MINT}/listings`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer YOUR_API_KEY`,
        },
        cache: "no-store",
      }
    );

    if (!listingRes.ok) {
      const text = await listingRes.text();
      console.error("Listing fetch failed:", text);
      return new Response("Failed to fetch listing", {
        status: 500,
        headers,
      });
    }

    const listings = (await listingRes.json()) as Listing[];

    if (!Array.isArray(listings) || listings.length === 0) {
      return new Response("No listing found", { status: 400, headers });
    }

    const listing = listings[0];

    if (
      typeof listing.price !== "number" ||
      !listing.seller ||
      !listing.auctionHouse
    ) {
      return new Response("Incomplete listing data", {
        status: 400,
        headers,
      });
    }

    // 2) Buy-Instruction holen
    const buyRes = await fetch(
      "https://api-mainnet.magiceden.dev/v2/instructions/buy_now",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer YOUR_API_KEY`,
        },
        body: JSON.stringify({
          buyer,
          seller: listing.seller,
          auctionHouseAddress: listing.auctionHouse,
          tokenMint: MINT,
          price: listing.price,
        }),
      }
    );

    if (!buyRes.ok) {
      const text = await buyRes.text();
      console.error("Buy instruction failed:", text);
      return new Response("Failed to create buy transaction", {
        status: 500,
        headers,
      });
    }

    const data = await buyRes.json();

    if (!data?.tx) {
      console.error("Unexpected buy response:", data);
      return new Response("Missing transaction in response", {
        status: 500,
        headers,
      });
    }

    return Response.json(
      {
        transaction: data.tx,
        message: `Buy TEFT NFT for ${listing.price} SOL`,
      },
      { headers }
    );
  } catch (error) {
    console.error("POST action error:", error);
    return new Response("Error", { status: 500, headers });
  }
}
