import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Wir holen die Daten direkt von Magic Eden
    const response = await fetch(
      "https://api-mainnet.magiceden.dev/v2/collections/teft_supreme/listings?limit=20",
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      throw new Error("Magic Eden API antwortet nicht");
    }

    const listings = await response.json();

    // Wir bereiten die Daten so vor, wie deine schwarze Card sie erwartet
    const items = listings.map((item: any) => ({
      address: item.tokenAddress,
      name: "TEFT Supreme",
      image: item.extra?.img || "/teft.png", // Fallback Bild
      price: item.price,
    }));

    // Wir berechnen einen groben Floor Price aus den ersten Items
    const floor = items.length > 0 ? items[0].price : 0;

    return NextResponse.json({
      items,
      floor,
      listed: items.length
    });
  } catch (error) {
    console.error("NFT API Error:", error);
    return NextResponse.json({ items: [], floor: 0, listed: 0 });
  }
}
