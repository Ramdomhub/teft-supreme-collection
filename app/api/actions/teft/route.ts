import { NextRequest } from "next/server";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Content-Encoding, Accept-Encoding",
  "X-Action-Version": "1.0.0",
  "X-Blockchain-Ids": "solana:mainnet-beta",
};

const MINT = "FBduFJSWcfExLLDyxzeiaB64Dh85KDKiFbN6DXsH6xzz";
const IMAGE_URL = "https://teft-supreme-collection.vercel.app/teft.png";

export async function OPTIONS() {
  return new Response(null, { headers });
}

export async function GET() {
  try {
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

    const listings = await listingRes.json();
    const firstListing = Array.isArray(listings) ? listings[0] : null;

    const price = firstListing?.price;
    const seller = firstListing?.seller;

    const description =
      typeof price === "number"
        ? `Inside X. Current price: ${price} SOL`
        : "Inside X. Currently unavailable";

    return Response.json(
      {
        title: "TEFT Supreme",
        description,
        icon: IMAGE_URL,
        label: typeof price === "number" ? `Buy for ${price} SOL` : "Unavailable",
        links: {
          actions: typeof price === "number"
            ? [
                {
                  label: `Buy for ${price} SOL`,
                  href: "https://teft-supreme-collection.vercel.app/api/actions/teft",
                },
              ]
            : [],
        },
        disabled: typeof price !== "number",
        extras: {
          mint: MINT,
          seller: seller ?? null,
          price: price ?? null,
        },
      },
      { headers }
    );
  } catch (error) {
    console.error("GET action error:", error);

    return Response.json(
      {
        title: "TEFT Supreme",
        description: "Inside X. Price currently unavailable",
        icon: IMAGE_URL,
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

    const listings = await listingRes.json();

    if (!Array.isArray(listings) || listings.length === 0) {
      return new Response("No listing found", { status: 400, headers });
    }

    const listing = listings[0];

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

    const data = await buyRes.json();

    return Response.json(
      {
        transaction: data.tx,
        message:
          typeof listing.price === "number"
            ? `Buy TEFT NFT for ${listing.price} SOL`
            : "Buy TEFT NFT",
      },
      { headers }
    );
  } catch (e) {
    console.error("POST action error:", e);
    return new Response("Error", { status: 500, headers });
  }
}
